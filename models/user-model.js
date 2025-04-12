const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    addressType: { type: String, default: "Other" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    addresses: [addressSchema],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order", // Reference to the Order model
      },
    ],
    transactions: [
      {
        amount: Number,
        status: String, // e.g., "Completed", "Pending"
        paymentMethod: String, // e.g., "Credit Card"
        createdAt: { type: Date, default: Date.now },
      },
    ],
    contact: Number,
    picture: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
  }
  // { timestamps: true }
);
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const userId = this._id; // User ka ID jo delete ho raha hai
  try {
    // User ke saath associated orders delete karein
    await mongoose.model("order").deleteMany({ userId });
    next(); // Agle middleware ya operation ke liye proceed karein
  } catch (error) {
    next(error); // Error handle karein
  }
});
module.exports = mongoose.models.User || mongoose.model("user", userSchema);
// module.exports = mongoose.model("address", addressSchema);
