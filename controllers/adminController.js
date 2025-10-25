const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../models/owner-model");
const jwt = require("jsonwebtoken");
const ownerModel = require('../models/owner-model')
module.exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const adminCount = await ownerModel.countDocuments();

  if (adminCount >= 5) {
    req.flash("error", "Maximum 5 admins allowed.");
    return res.redirect("/owners/admin-login");
  }
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    req.flash("error", "Admin email already exists.");
    return res.redirect("/owners/admin-login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new Admin({ name, email, password: hashedPassword });

  await newAdmin.save();
  req.flash("success", "Admin signup successful! Please login.");
  res.redirect("/owners/admin-login");
};

module.exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const adminCount = await ownerModel.countDocuments();

  // 2. Agar koi admin nahi hai ya limit exceed ho rahi hai
  if (adminCount === 0) {
    req.flash("error", "No admins available.");
    return res.redirect("/owners/admin-login");
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    req.flash("error", "Admin not found.");
    return res.redirect("/owners/admin-login");
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    req.flash("error", "Invalid password.");
    return res.redirect("/owners/admin-login");
  }

  const token = jwt.sign(
    { email: admin.email, role: "admin" },
    process.env.JWT_KEY
  );

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/owners");
};

module.exports.logoutAdmin = (req, res) => {
  res.cookie("token", "");
  return res.redirect("/owners/admin-login");
};
