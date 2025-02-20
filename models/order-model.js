const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    orderDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: { type: String, default: 'Online' },
    trackingUpdates: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', // Link to the Product model
        required: true
    }
});

const Order = mongoose.model('order', orderSchema);
module.exports = Order;