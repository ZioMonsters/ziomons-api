module.exports = () => (req, res, next) => {
  const contentType = req.get("content-type")
  try {
    if (contentType && contentType.toLowerCase().includes("application/json")) {
      req.body = JSON.parse(req.body)
    }
  }
  catch (err) {
    return res.error(err)
  }
  next()
}
