const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const Transaction = require("../models/transaction");
const upload = require("../config/multer-config");
const Cart = require("../models/order-model");
const Order = require("../models/order-model");
const priceModel = require("../models/price-model");
const mongoose = require("mongoose");
const isUser = require("../middlewares/isUser");
const bcrypt = require("bcrypt");

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const products = await productModel.find({
      name: { $regex: query, $options: "i" },
    });
    res.render("search", { products, query });
  } catch (err) {
    console.error(err);
    res.render("search", { products: [], query: req.query.q });
  }
});
// router.post("/createOrder/:userId", isLoggedIn, isUser, async(req, res) => {
//     try {
//         const amount = Number(req.body.amount);
//         const paymentMethod = req.body.paymentMethod;
//         const orderId = req.body.orderId;

//         if (isNaN(amount) || amount < 0) {
//             return res.status(400).json({ message: "Invalid amount value" });
//         }

//         let user = await userModel.findOne({ email: req.user.email }).populate("cart"); // ✅ Populate cart

//         if (!user.cart.length) {
//             return res.status(400).send("Cart is empty.");
//         }

//         // Transaction create karein
//         const newTransaction = {
//             amount: amount,
//             status: "Completed",
//             paymentMethod: paymentMethod,
//             orderId: orderId,
//             createdAt: new Date(),
//         };

//         user.transactions.push(newTransaction);

//         // Add cart items to user orders
//         user.orders.push(...user.cart);

//         // Create an order for each cart item
//         for (let item of user.cart) {
//             const order = new Order({
//                 userId: req.params.userId,
//                 amount: item.price, // Use item's price
//                 paymentMethod: req.body.paymentMethod,
//                 trackingUpdates: [{ status: "Order Placed" }],
//                 productId: item._id, // ✅ Assign productId properly
//             });

//             await order.save();
//         }

//         // Clear cart after adding orders
//         user.cart = [];
//         await user.save();

//         res.redirect("/cart");
//     } catch (error) {
//         console.error("Transaction error:", error.message);
//         res.status(500).json({ message: "Error adding transaction" });
//     }
// });
// filter price
router.get("/products", async (req, res) => {
  try {
    let filter = {}; // Empty filter object

    if (req.query.price) {
      const priceRanges = Array.isArray(req.query.price)
        ? req.query.price
        : [req.query.price];

      const priceFilters = priceRanges.map((range) => {
        const [min, max] = range.split("-").map(Number);
        return { price: { $gte: min, $lte: max } };
      });

      filter.$or = priceFilters;
    }

    const products = await productModel.find(filter);

    res.render("filteredProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/", async function (req, res) {
  const categories = await productModel.distinct("category");
  let products = await productModel.find();
  res.render("Home", { user: req.user, categories, products });
});
router.get("/profile", isLoggedIn, isUser, async function (req, res) {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });
    const categories = await productModel.distinct("category");
    let user = await userModel.findOne({ email: req.user.email }).populate({
      path: "orders",
      populate: { path: "productId" },
    });

    if (!user) {
      req.flash("error", "User not found. Please login again.");
      return res.redirect("/my-account");
    }
    const pricing = await priceModel.findOne();
    const shippingCharge = pricing.deliveryCharges;
    let orders = await Order.find({ userId: user._id });
    let products = await productModel.find();

    res.render("dashboard", {
      user,
      addresses: user.addresses,
      categories,
      orders,
      products,
      transactions: transactions,
      shippingCharge,
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    req.flash("error", "Failed to load profile.");
    res.redirect("/my-account");
  }
});

router.get("/addAddress", isLoggedIn, isUser, async function (req, res) {
  // let user = await userModel.findOne({ email: req.user.email });
  res.render("address");
});
router.post("/edit/:userId", isLoggedIn, isUser, async function (req, res) {
  let { fullname, contact } = req.body;
  let user = await userModel.findOneAndUpdate(
    { _id: req.params.userId },
    { fullname, contact },
    { new: true }
  );
  res.redirect("/profile");
});
router.get("/forgot", function (req, res) {
  let error = req.flash("error");
  res.render("forgot", { error });
});
router.post("/edit", async function (req, res) {
  try {
    let { email, password } = req.body;
    const user = await userModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/my-account");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    req.flash("success", "Password updated successfully.");
    res.redirect("/my-account");
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/my-account");
  }
});

router.post("/addAddress", isLoggedIn, isUser, async function (req, res) {
  try {
    // Find the user by email
    let user = await userModel.findOne({ email: req.user.email });

    // Create a new address object from request body
    const newAddress = {
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      fullAddress: req.body.fullAddress,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      addressType: req.body.addressType || "Other",
      isDefault: req.body.isDefault === "on" ? true : false,
    };

    // If the new address is default, make others non-default
    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Push the new address to user's addresses array
    user.addresses.push(newAddress);

    // Save the updated user
    await user.save();

    // Redirect to the address list page
    res.redirect(req.get("Referer") || "/profile");
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).send("Error saving address.");
  }
});
router.get("/product-category/all", async function (req, res) {
  try {
    // const category = req.params.category; // Get category from URL
    const products = await productModel.find(); // Fetch products from DB
    res.render("all", { products, user: req.user });
    // Render single EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/product-category/:category", async function (req, res) {
  try {
    const category = req.params.category; // Get category from URL
    const products = await productModel.find({ category: category }); // Fetch products from DB
    res.render("category", { category, products, user: req.user });
    // Render single EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/product/:productId", async function (req, res) {
  try {
    const productId = req.params.productId;
    const products = await productModel.find();
    const product = await productModel.findOne({ _id: productId });
    const pricing = await priceModel.findOne();
    if (!product) {
      return req.flash("Pricing or product not found");
    }

    const goldCost = pricing.goldPrice * product.gold;
    const makingCost = pricing.makingPrice * product.gold;
    const subtotal = goldCost + makingCost;
    const gstAmount = (subtotal * pricing.gst) / 100;
    const grandTotal = subtotal + gstAmount;

    res.render("productDetails", {
      products,
      user: req.user,
      pricing: pricing || [],
      product: product || [],
      goldCost,
      makingCost,
      subtotal,
      gstAmount,
      grandTotal,
    }); // Render single EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/cart", isLoggedIn, isUser, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");

  if (!user) {
    req.flash("error", "User not found or unauthorized.");
    res.redirect(req.get("Referer") || "/");
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
  let error = req.flash("error");
  res.render("cart", {
    user,
    discountedPrice,
    totalSaved,
    categories,
    shippingCharge,
    error,
  });
});

router.get(
  "/add-to-cart/:productId",
  isLoggedIn,
  isUser,
  async function (req, res) {
    try {
      let user = await userModel.findOne({ email: req.user.email });
      // if (!user) {
      //   req.flash("error", "User not found or unauthorized.");
      //   res.redirect(req.get("Referer") || "/");
      // }
      const productId = req.params.productId;
      // const objectId = new mongoose.Types.ObjectId(productId);
      // const isInCart = user.cart.some(item => item.equals(objectId));
      user.cart.push(req.params.productId);
      await user.save();
      req.flash("successs", "Added to cart");
      res.redirect(req.get("Referer") || "/");
    } catch (error) {
      console.error(error);
      res.redirect(req.get("Referer") || "/");
    }
  }
);
router.get("/remove/:productId", isLoggedIn, isUser, async function (req, res) {
  try {
    const user = await userModel.findOne({ _id: req.user._id });
    const productId = req.params.productId;
    const objectId = new mongoose.Types.ObjectId(productId);

    const index = user.cart.findIndex(
      (item) => item.toString() === objectId.toString()
    );
    if (index !== -1) {
      user.cart.splice(index, 1);
    }
    await user.save();
    req.flash("success", "Product removed from cart");
    res.redirect(req.get("Referer") || "/");
  } catch (err) {
    console.error("error");
    res.redirect(req.get("Referer") || "/");
  }
});

router.get("/my-account", function (req, res) {
  let error = req.flash("error");
  res.render("login", { error });
});
// Edit address route
router.post("/updateAddress", isLoggedIn, async (req, res) => {
  const {
    fullName,
    phoneNumber,
    fullAddress,
    city,
    state,
    country,
    zipCode,
    addressType,
  } = req.body;

  await userModel.findOneAndUpdate(
    { email: req.user.email },
    {
      addresses: {
        fullName,
        phoneNumber,
        fullAddress,
        city,
        state,
        country,
        zipCode,
        addressType,
      },
    },
    { new: true, runValidators: true }
  );

  req.flash("success", "Address updated successfully.");
  res.redirect("/profile");
});
router.get("/updateAddress", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ _id: req.user._id });
  res.render("updateAddress", { user });
});
router.get("/contact",function(req,res){
  res.render("contactUs");
})
module.exports = router;
