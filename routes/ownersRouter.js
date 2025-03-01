const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const Transaction = require("../models/transaction");
const Pricing = require("../models/price-model");
const Order = require("../models/order-model");
const isAdmin = require("../middlewares/isAdmin");
const isLoggedIn = require("../middlewares/isLoggedIn");
const upload = require("../config/multer-config");
const bcrypt = require("bcrypt");
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../controllers/adminController");
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin);

module.exports = router;
if (process.env.Node_ENV === "development") {
  router.post("/create", async function (req, res) {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res.send("you can't create owner");
    }
    let { fullname, email, password } = req.body;
    let createdOwner = await ownerModel.create({
      fullname,
      email,
      password,
    });
    res.send(createdOwner);
  });
}
router.get("/admin-login", function (req, res) {
  let error = req.flash("error");
  res.render("adminLogin", { error });
});
router.get("/", isLoggedIn, isAdmin, async function (req, res) {
  try {
    let success = req.flash("success");
    const orders = await Order.find()
      .populate({ path: "userId", select: "fullname" }) // ✅ Only fetch fullName from User
      .populate("productId") // ✅ Fetch product details
      .lean(); // Convert to plain JS objects

    // Remove orders where the product has been deleted
    const filteredOrders = orders.filter((order) => order.productId !== null);

    // const order = await Order.findById(orderId).populate('userId', 'fullname');
    let products = await productModel.find();
    let user = await userModel.find();
    const uniqueUsersCount = await userModel.distinct("_id").countDocuments();
    let admin = await ownerModel.findOne();
    const totalOrders = orders.length ? orders.length : 0;
    const pricing = await Pricing.findOne();
    let count = 0;
    orders.forEach(function (order) {
      if (order.status !== "Cancelled") {
        count++;
      }
    });
    const transactions = await Transaction.find().populate(
      "userId",
      "fullname email"
    );
    let error = req.flash("error");
    res.render("admin", {
      success,
      users: uniqueUsersCount,
      user: user,
      orders: filteredOrders,
      admin,
      totalOrders,
      pricing,
      products,
      error,
      transactions,
      count,
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    res.status(500).send("Error fetching transactions");
  }
});

router.post("/cancel-order/:orderId", isLoggedIn, isAdmin, async (req, res) => {
  const { orderId } = req.params;
  try {
    // Remove order from the orders collection
    await Order.findByIdAndDelete(orderId);

    // Also remove it from the user's orders
    await User.updateMany(
      { "orders.orderId": orderId },
      { $pull: { orders: { orderId } } }
    );

    res
      .status(200)
      .json({ success: true, message: "Order canceled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
});

router.post("/update", isLoggedIn, isAdmin, async (req, res) => {
  const { gst, makingPrice, goldPrice, deliveryCharges } = req.body;

  try {
    const pricing = await Pricing.findOneAndUpdate(
      {},
      {
        gst,
        makingPrice,
        goldPrice,
        deliveryCharges,
        updatedAt: new Date(),
      },
      {
        upsert: true, // Create if not exists
        new: true, // Return updated document
        runValidators: true, // Enforce schema validation
      }
    );
    res.redirect("/owners");
  } catch (err) {
    console.error("Pricing Update Error:", err);
    res.status(500).send("Failed to update pricing.");
  }
});
router.post("/orders/:id/status", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect("/owners#orders"); // Works because it's a form submission
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
//cancel order
router.put("/orders/:id/cancel", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/delete-products", isLoggedIn, isAdmin, async (req, res) => {
  const { productIds } = req.body;
  try {
    await productModel.deleteMany({ _id: { $in: productIds } });
    await userModel.updateMany(
      { "orders.productId": { $in: productIds } },
      { $pull: { orders: { productId: { $in: productIds } } } }
    );

    // 3. Also remove them from the Order collection
    await orderModel.deleteMany({ productId: { $in: productIds } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/edit-product/:id", isLoggedIn, isAdmin, async (req, res) => {
  const product = await productModel.findById(req.params.id);
  res.render("editProduct", { product });
});

router.post(
  "/update-product/:id",
  isLoggedIn,
  isAdmin,
  upload.array("images", 10),
  async (req, res) => {
    let {
      name,
      price,
      discount,
      category,
      description,
      size,
      color,
      metal,
      gold,
    } = req.body;

    try {
      const product = await productModel.findById(req.params.id);

      if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/owners");
      }

      //  Nayi images aayi hain to update karo, warna purani images ko rakho
      const updatedImages =
        req.files && req.files.length > 0
          ? req.files.map((file) => file.buffer)
          : product.images;

      // Product ko update karo
      await productModel.findByIdAndUpdate(req.params.id, {
        images: updatedImages,
        name,
        price,
        discount,
        category,
        description,
        size,
        color,
        metal,
        gold,
      });

      req.flash("success", "Product updated successfully.");
      res.redirect("/owners");
    } catch (error) {
      console.error("Update Error:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get("/viewUser/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.render("viewUser", { user }); // Render a view-user.ejs page
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// router.delete("/deleteUser/:id", isLoggedIn, isAdmin, async (req, res) => {
//   try {
//     const user = await userModel.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }
//     res.redirect("/owners");
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
router.get("/viewOrder/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("productId")
      .populate("shippingAddress");

    const user = await userModel.findOne({ _id: req.user._id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    let product = order.productId;
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.render("viewOrder", { order, user, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.put("/cancelOrder/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    confirm("are you sure ?");
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // User ke orders array se order ko remove karein
    await userModel.findByIdAndUpdate(order.userId, {
      $pull: { orders: order._id },
    });

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/edit/", isLoggedIn, isAdmin, async function (req, res) {
  let { old, password } = req.body;
  const admin = await ownerModel.findOne();

  if (!admin) {
    req.flash("error", "Admin not found.");
    // let error = req.flash("error");
    return res.redirect("/owners/admin-login");
  }

  const isMatch = await bcrypt.compare(old, admin.password);
  if (!isMatch) {
    req.flash("error", "Invalid old password.");
    return res.redirect("/owners");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await ownerModel.findOneAndUpdate(
    { _id: req.user._id },
    { password: hashedPassword },
    { new: true }
  );

  req.flash("success", "Password updated successfully.");
  res.redirect("/owners");
});
router.post("/edit/email", isLoggedIn, isAdmin, async function (req, res) {
  let { email } = req.body;
  const admin = await ownerModel.findOne();
  if (!admin) {
    req.flash("error", "Admin not found.");
    return res.redirect("/owners/admin-login");
  }
  await ownerModel.findOneAndUpdate({ email: email }, { new: true });

  res.redirect("/owners");
});

module.exports = router;
