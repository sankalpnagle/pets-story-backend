const bcrypt = require("bcrypt")

const createPassword = (password)=>{
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

const comparePassword = (current,prevPassword) => {
    return bcrypt.compareSync(current,prevPassword)
}

module.exports = { createPassword, comparePassword}