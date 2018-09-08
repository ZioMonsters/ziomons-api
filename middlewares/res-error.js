module.exports = () => (req, res, next) => {
  res.error = (err, status, type) => {
    const { status: errStatus, type: errType, message, stack } = err
    ;["status", "stack", "type"].forEach(key => {
      delete err[key]
    })
    const out = {
      ...err,
      message,
      type: type || errType || "INTERNAL_SERVER_ERROR"
    }

    if (process.env.NODE_ENV !== "production") {
      out.stack = stack
    }

    res.status(status || errStatus || 500).json(out)
  }
  next()
}
