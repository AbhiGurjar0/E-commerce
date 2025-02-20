const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkLogin = require("../middlewares/checkLogin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const Cart = require("../models/cart-model");

router.get("/", checkLogin, function (req, res) {
  res.render("Home", { user: req.user });
});
router.get("/product-category/:category", async function (req, res) {
  try {
    const category = req.params.category; // Get category from URL
    const products = await productModel.find({ category: category }); // Fetch products from DB
    res.render("category", { category, products, user: req.user }); // Render single EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/product/:productId", async function (req, res) {
  try {
    const productId  = req.params.productId; 
    const products = await productModel.find({ _id: productId }); 
    res.render("productDetails", {  products, user: req.user }); // Render single EJS template
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


router.get("/cart", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");

  const Total = user.cart.reduce(
    (total, item) => total + Number(item.price),
    0
  );
  const discountedPrice = user.cart.reduce(
    (total, item) => total + Number(item.price) - Number(item.discount),
    0
  );
  const totalSaved = Total - discountedPrice;
  res.render("cart", { user, discountedPrice, totalSaved });
});

router.get("/add-to-cart/:productid", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("successs", "Added to cart");
    res.redirect(req.get("Referer") || "/");
  } catch (error) {
    console.error(error);
    res.redirect(req.get("Referer") || "/");
  }
});

// ✅ Add product to cart (or increase quantity)
// router.get("/add-to-cart/:productid",isLoggedIn, async (req, res) => {
//     // const { productId, userId } = req.body;

//     try {
//         let user = await userModel.findOne({ email: req.user.email });
//         // let cart = await Cart.findOne({ user: userId });

//         // if (!cart) {
//         //     cart = new Cart({ user: userId, items: [] });
//         // }

//         const productIndex = user.items.findIndex(
//             (item) => item.product.toString() === productid
//         );

//         if (productIndex > -1) {
//             cart.items[productIndex].quantity += 1;
//         } else {
//             cart.items.push({ product: productId, quantity: 1 });
//         }

//         await cart.save();
//         res.redirect(req.get("Referer") || "/");
//     } catch (error) {
//         console.error(error);
//         res.redirect(req.get("Referer") || "/");
//     }
// });

// // ✅ View Cart Page
// router.get("/cart/:userId", async (req, res) => {
//     try {
//         const cart = await Cart.findOne({ user: req.params.userId }).populate("items.product");
//         //  console.log(cart);
//         res.render("cart", { cart });
//     } catch (error) {
//         console.error(error);
//         res.redirect("/");
//     }
// });

// // ✅ Remove product from cart
// router.post("/remove-from-cart", async (req, res) => {
//     const { productId, userId } = req.body;

//     try {
//         let cart = await Cart.findOne({ user: userId });

//         if (cart) {
//             cart.items = cart.items.filter((item) => item.product.toString() !== productId);
//             await cart.save();
//         }

//         res.redirect(req.get("Referer") || "/");
//     } catch (error) {
//         console.error(error);
//         res.redirect(req.get("Referer") || "/");
//     }
// });

// // ✅ Decrease product quantity
// router.post("/decrease-quantity", async (req, res) => {
//     const { productId, userId } = req.body;

//     try {
//         let cart = await Cart.findOne({ user: userId });

//         if (cart) {
//             const productIndex = cart.items.findIndex(
//                 (item) => item.product.toString() === productId
//             );

//             if (productIndex > -1) {
//                 if (cart.items[productIndex].quantity > 1) {
//                     cart.items[productIndex].quantity -= 1;
//                 } else {
//                     cart.items.splice(productIndex, 1);
//                 }
//                 await cart.save();
//             }
//         }

//         res.redirect(req.get("Referer") || "/");
//     } catch (error) {
//         console.error(error);
//         res.redirect(req.get("Referer") || "/");
//     }
// });

router.get("/my-account", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error });
});
router.get("/shop", isLoggedIn, async function (req, res) {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success });
});

module.exports = router;
