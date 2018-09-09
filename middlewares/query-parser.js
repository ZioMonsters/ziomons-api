module.exports = () => (req, res, next) => {

  if (!req.query) {
    req.query = {}
  }

  const { params } = req.query
  const invalidQueryParams = Object.entries(req.query).filter(([key]) => key !== "params")
  if (invalidQueryParams.length) {
    return res.send(new Error(`Invalid query keys; the only allowed query parameter is "params" and accepts a JSON value (example: params={${invalidQueryParams.map(([key, value])=> `"${key}": "${value}"`).join(", ")}} )`))
  }

  try {
    if (params) {
      req.query = JSON.parse(params)
      // req.query = params
    }
  } catch (err) {
    return res.send(err)
  }
  next()
}
