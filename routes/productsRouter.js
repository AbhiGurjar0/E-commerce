const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isAdmin = require("../middlewares/isAdmin");
const isLoggedIn = require("../middlewares/isLoggedIn");
router.post(
  "/create",
  isLoggedIn,
  isAdmin,
  upload.array("images", 5),
  async function (req, res) {
    try {
      // console.log(req.files.map(file => file.buffer)); // Log uploaded images
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
      category = category.trim().toLowerCase();
      let product = await productModel.create({
        images: req.files.map((file) => file.buffer),
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

      req.flash("success", "Product created successfully");
      res.redirect("/owners");
    } catch (err) {
      res.send(err.message);
    }
  }
);

module.exports = router;
