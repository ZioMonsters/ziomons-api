const Valkyrie = require("aws-valkyrie")
const app = new Valkyrie()
const AWS = require("aws-sdk")
const dynamodb = new AWS.DynamoDB({ region: "eu-west-3" })
const documentClient = new AWS.DynamoDB.DocumentClient({ region: "eu-west-3" })
const pkg = require("./package.json")
const validateSchema = require("./validator.js")
const schemas = require("./schemas.js")

const env = "production"
const paginatorLimit = 32

;["body-parser", "query-parser", "res-error", "cors"].forEach(middleware => app.use(require(`./middlewares/${middleware}.js`)()))

app.options("*", (req, res) => {
  res.sendStatus(200)
})

app.get("/home", (req, res) => res.send("This is cryptomon"))

app.get("/info", (req, res) => res.json(pkg))

// returns an array of objects ({ id, attack, defence, speed, experience, level, rarity })
app.get("/listMonsters", validateSchema(schemas.listMonsters), ({ query: { address, next, limit = 50 } }, res) => {
  documentClient.query({
    TableName: `cryptomon-monsters-${process.env.NODE_ENV}`,
    IndexName: "user-monsterId-index",
    Limit: limit,
    ...(next ? { ExclusiveStartKey: Object.assign({}, next, {
      address
    }) } : {}),
    KeyConditions: {
      user: {
        ComparisonOperator: "EQ",
        AttributeValueList: [address]
      }
    },
    ExpressionAttributeNames: {
      "#monsterId": "monsterId",
      "#attack": "attack",
      "#defence": "defence",
      "#speed": "speed",
      "#experience": "experience",
      "#level": "level",
      "#rarity": "rarity"
    },
    ProjectionExpression: "#monsterId, #attack, #defence, #speed, #experience, #level, #rarity"
  }).promise()
    .then(({ Items, Count: count }) => res.json({
      count,
      monsters: Items.map(item => {
        item.id = item.monsterId
        delete item.monsterId
        return item
      })
    }))
    .catch(err => {
      console.error(err)
      res.send(err)
    })
})

// get monster details
app.get("/getMonster", validateSchema(schemas.getMonster), ({ query: { monsterId }}, res) => {
  documentClient.get({
    TableName: `cryptomon-monsters-${process.env.NODE_ENV}`,
    Key: {
      monsterId
    }
  }).promise()
    .then(data => {
      if (data.Item) {
        res.json(data.Item)
      } else {
        const err = new Error("Not found")
        err.status = 404
        err.type = "NOT_FOUND"
        throw err
      }
    })
    .catch(err => res.error(err))
})

// returns an array of objects ({ clashId, opponent, userTeam, opponentTeam, bonusWinner, result, bet })
// result can be WON, LOST or DRAW
app.get("/listClashes", validateSchema(schemas.listClashes), ({ query: { address, next, limit = 50 } }, res) => {
  documentClient.query({
    TableName: `cryptomon-clashes-${process.env.NODE_ENV}`,
    IndexName: "user-clashId-index",
    Limit: limit,
    ...(next ? { ExclusiveStartKey: Object.assign({}, next, { user: address }) } : {}),
    KeyConditions: {
      user: {
        ComparisonOperator: "EQ",
        AttributeValueList: [address]
      }
    },
    ExpressionAttributeNames: {
      "#clashId": "clashId",
      "#opponent": "opponent",
      "#userTeam": "userTeam",
      "#opponentTeam": "opponentTeam",
      "#bonusWinner": "bonusWinner",
      "#result": "result",
      "#bet": "bet"
    },
    ProjectionExpression: "#clashId, #opponent, #userTeam, #opponentTeam, #bonusWinner, #result, #bet"
  }).promise()
    .then(({ Items, Count }) => res.json({ count: Count, clashes: Items }))
    .catch(err => res.error(err))
})

// get battle info
app.get("/getBattle", validateSchema(schemas.getBattle), ({ query: { clashId, address } }, res) => {
  documentClient.get({
    TableName: `cryptomon-clashes-${env}`,
    Key: {
      clashId,
      user: address
    }
  }).promise()
    .then(data => res.json(data.Item))
    .catch(err => res.error(err))
})

app.get("/monstersInSale", ({ queryStringParameters: { ExclusiveStartKey } }, res) => {
  if (ExclusiveStartKey) {
    try {
      ExclusiveStartKey = JSON.parse(ExclusiveStartKey)
    } catch (err) {
      return res.status(400).send("Invalid ExclusiveStartKey parameter.")
    }
  }
  const params = {
    TableName: `cryptomon-shop-${env}`,
    ExclusiveStartKey,
    Limit: paginatorLimit
  }

  dynamodb.scan(params)
    .promise()
    .then(e => res.status(200).json(e))
    .catch(e => res.status(500).json(e))
})

app.all("*", (req, res) => res.sendStatus(404))

app.use(require("./middlewares/validation-error.js")())

exports.handler = (...args) => app.listen(...args)
