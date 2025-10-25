const Product = require('../models/product-model');

async function categoryMiddleware(req, res, next) {
  try {
    // MongoDB se unique categories lein
    const categories = await Product.distinct('category');
    
    // res.locals mein categories store karein (EJS ke liye)
    res.locals.categories = categories;
     
    next();
  } catch (error) {
    console.error('Error fetching categories:', error);
    next(error);
  }
}

module.exports = categoryMiddleware;