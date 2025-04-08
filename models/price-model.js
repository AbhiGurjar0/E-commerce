const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  gst: { type: Number, default:0},
  makingPrice: { type: Number, default:0 },
  goldPrice: { type: Number, default:0 },
  deliveryCharges:{ type: Number, default:0},
  updatedAt: { type: Date, default: Date.now }
});
 
module.exports = mongoose.model("Pricing", pricingSchema);