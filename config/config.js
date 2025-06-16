require("dotenv").config(); 

const config = {
  root: process.env.DB_ROOT,
  databaseName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  dialect: process.env.DB_DIALECT,
};

module.exports =  config ;
