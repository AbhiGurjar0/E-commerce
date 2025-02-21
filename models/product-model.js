const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  images: [{
    type: Buffer,
    required: true,
  }],
  name: String,
  price: Number,
  discount: Number,
  category: String,
  description: String,
  size: String,
  color: String,
  metal: String,
  gold:{
    type :Number,
    default:0,
  }
});

module.exports = mongoose.model("product", productSchema);
