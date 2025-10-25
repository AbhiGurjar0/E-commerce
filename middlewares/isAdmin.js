const isLoggedIn = require("../middlewares/isLoggedIn");
module.exports = [isLoggedIn, function (req, res, next) {
    if (req.user.role !== "admin") {
      req.flash("error", "Access Denied! Admins only.");
      return res.redirect("/my-account");
    }
    next();
  }];
  