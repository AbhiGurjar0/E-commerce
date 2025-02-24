const isLoggedIn = require("../middlewares/isLoggedIn");
module.exports = [isLoggedIn, function (req, res, next) {
  // console.log("Checking user role:", req.user?.role);
  if (req.user.role !== "user") {
      req.flash("error", "Access Denied! Users only.");
      return res.redirect("/my-account");
  }
  next();
}];
  