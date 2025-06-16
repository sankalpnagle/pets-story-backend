const Product = require("../model/Product");

const getProductList = async (req, res,next) => {
  try {
    const userId = req.user.id;
    return await Product.findAll({ where: { userId } });
  } catch (error) {
    next(error)
  }
};
