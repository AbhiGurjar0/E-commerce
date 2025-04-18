const mongoose = require('mongoose');
// const dbgr = require("debug")("development:mongoose");
const config = require("config"); 
// mongoose
// .connect(`${config.get("MONGODB_URI")}/scatch`)
// .then(function(){
//     dbgr("connected");
// })
// .catch(function(err){
//     dbgr(err);
// })

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

module.exports = mongoose.connection;