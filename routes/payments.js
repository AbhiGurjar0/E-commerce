const express = require("express");
const razorpay = require("../config/razorpay"); // Razorpay instance
const crypto = require("crypto");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isUser = require("../middlewares/isUser");
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const Transaction = require("../models/transaction");
const Order = require("../models/order-model");
const priceModel = require("../models/price-model");

const router = express.Router();

router.get("/checkOut", isLoggedIn, isUser, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");

  if (!user.addresses || user.addresses.length === 0) {
    req.flash("error", "Please add an address before checkout.");
    return res.redirect("/cart"); // Wapas cart par le jao
  }
  const pricing = await priceModel.findOne();
  const shippingCharge = pricing.deliveryCharges;
  const Total = user.cart.reduce(
    (total, item) => total + Number(item.price),
    0
  );
  const discountedPrice = user.cart.reduce(
    (total, item) => total + Number(item.price) - Number(item.discount),
    0
  );
  const totalSaved = Total - discountedPrice;
  const categories = await productModel.distinct("category");
  const razorpayKey = process.env.RAZORPAY_KEY_ID;

  res.render("checkout", {
    user,
    discountedPrice,
    totalSaved,
    shippingCharge,
    razorpayKey,
  });
});

// 🟢 Create Razorpay Order
router.post("/create-order", async (req, res) => {
  const { amount, userId, paymentMethod } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  const pricing = await priceModel.findOne();
  const shippingCharge = pricing.deliveryCharges;

  const options = {
    amount: amount * 100 , // Paise me (₹1 = 100 paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
});


// 🟡 Verify Payment
router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    amount,
    paymentMethod,
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    try {
      // Transaction Create
      const transaction = new Transaction({
        userId,
        amount,
        paymentMethod,
        orderId: razorpay_order_id,
        status: "Completed",
      });
      await transaction.save();

      // User Order Process
      const user = await userModel.findById(userId).populate("cart");

      if (!user || !user.cart.length) {
        return res
          .status(400)
          .json({ message: "Cart is empty or user not found" });
      }

      // Add cart items to orders
      user.orders.push(...user.cart);

      for (let item of user.cart) {
        const order = new Order({
          userId,
          amount: item.price,
          paymentMethod,
          trackingUpdates: [{ status: "Order Placed" }],
          productId: item._id,
          shippingAddress:user.addresses[0],
        });
        await order.save();
      }

      // Clear Cart
      user.cart = [];
      await user.save();

      res.json({
        success: true,
        message: "Payment verified and order placed successfully",
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Payment verification failed" });
    }
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid payment signature" });
  }
});

module.exports = router;

module.exports = router;
