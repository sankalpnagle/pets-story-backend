const User = require("../model/User");
const { createPassword, comparePassword } = require("../utils/common");

const createUser = async (req, res, next) => {
  const { email, name, password } = req.body;
  try {
    const checkUser = await checkUserExist(null, email);
    if (checkUser) {
      res
        .status(409)
        .json({ data: null, success: false, message: "User already exist" });
    } else {
      const hashPassword = await createPassword(password);
      const result = User.create({
        name: name,
        password: hashPassword,
        email: email,
      });

      res.status(201).json({
        data: { id: result.id, email, name },
        success: true,
        message: "User register Success",
      });
    }
  } catch (error) {
    next(error);
  }
};

const getUserList = async (req, res, next) => {
  try {
    const result = await User.findAndCountAll();
    res.status(200).json({
      success: true,
      data: result,
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
};

const checkUserExist = async (id, email) => {
  let user;
  if (id) {
    user = await User.findOne({ where: { id: id } });
  }
  if (email) {
    user = await User.findOne({ where: { email: email } });
  }
  return user;
};

module.exports = { createUser, getUserList };
