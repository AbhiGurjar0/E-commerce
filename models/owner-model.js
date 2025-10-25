const mongoose = require("mongoose");

const ownerSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,
  products: {
    type: Array,
    default: [],
  },
  orders: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      status: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  role: { type: String, enum: ["user", "admin"], default: "admin" },
  gstin:{
    type:String,
    default:0,
  },
  goldPrice:{
    type:String,
    default:0,
  },
});

module.exports = mongoose.model("owner", ownerSchema);
