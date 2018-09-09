module.exports = () => (req, res, next) => {
  console.log(req.query)
  if (!req.query) {
    req.query = {}
  }

  const { params } = req.query
  const invalidQueryParams = Object.entries(req.query).filter(([key]) => key !== "params")
  if (invalidQueryParams.length) {
    return res.error(new Error(`Invalid query keys; the only allowed query parameter is "params" and accepts a JSON value (example: params={${invalidQueryParams.map(([key, value])=> `"${key}": "${value}"`).join(", ")}} )`))
  }

  try {
    if (params) {
      req.query = JSON.parse(params)
      // req.query = params
    }
  } catch (err) {
    return res.error(err)
  }
  next()
}
