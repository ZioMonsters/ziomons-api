const { Validator } = require("express-json-validator-middleware")

module.exports = new Validator({ allErrors: true }).validate
