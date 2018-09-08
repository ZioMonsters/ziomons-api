const { ValidationError } = require("express-json-validator-middleware")

module.exports = () => (err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({
      message: "Validation error",
      validationErrors: err.validationErrors
    })
  } else {
    next(err)
  }
}
