const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  image:Buffer,
  name:String,
  price:Number,
  discount:{
    type:Number,
    default:0
  },
  bgcolor:String,
  penelcolor:String,
  textcolor:String,
  category: {
    type: String,
    required: true 
  }
});

module.exports = mongoose.model("product",productSchema)
