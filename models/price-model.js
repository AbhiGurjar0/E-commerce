const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  gst: { type: Number, default:0, required: true },
  makingPrice: { type: Number, default:0, required: true },
  goldPrice: { type: Number, default:0, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pricing", pricingSchema);