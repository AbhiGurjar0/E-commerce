const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Online", "HDFC"], required: true },
    orderId: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
