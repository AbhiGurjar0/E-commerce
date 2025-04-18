require('dotenv').config();


const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const index = require("./routes/index");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const expressSession = require("express-session");
const categoryMiddleware = require('./middlewares/categoryMiddleware');
const flash = require("connect-flash");
const payments = require("./routes/payments");
const db = require("./config/mongoose-connection");
// require('dotenv').config();

app.use(categoryMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.Express_SESSION_SECRET,
  })
);
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.set("view engine", "ejs");
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/", index);
app.use("/payment",payments);

app.listen(3000);
