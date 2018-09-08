const Valkyrie = require("aws-valkyrie")
const app = new Valkyrie()
const AWS = require("aws-sdk")
const dynamodb = new AWS.DynamoDB({ region: "eu-west-3" })
const documentClient = new AWS.DynamoDB.DocumentClient({ region: "eu-west-3" })
const pkg = require("./package.json")

const env = "production"
const paginatorLimit = 32

;["body-parser", "query-parser", "res-error"].forEach(middleware => app.use(require(`./middlewares/${middleware}.js`)()))

app.get("/home", (req, res) => res.send("This is cryptomon"))

app.get("/info", (req, res) => res.json(pkg))

// returns an array of objects ({ id, attack, defence, speed, experience, level, rarity })
// da mettere validation del limit e del next nel middleware di validation
app.get("/listMonsters", ({ query: { address, next, limit = 50 } }, res) => {

  // da spostare in un middleware di validation
  // if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return res.status(400).send("Invalid address parameter.")

  // if (ExclusiveStartKey) {
  //   try {
  //     ExclusiveStartKey = JSON.parse(ExclusiveStartKey)
  //   } catch (err) {
  //     return res.status(400).send("Invalid ExclusiveStartKey parameter.")
  //   }
  // }

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
  //
  // const params = {
  //   TableName: `cryptomon-monsters-${env}`,
  //   Limit: paginatorLimit,
  //   ExclusiveStartKey,
  //   ExpressionAttributeValues: {
  //     ":a" : {
  //       S: address.substr(2)
  //     }
  //   },
  //   KeyConditionExpression: "address = :a"
  // }
  //
  // dynamodb.query(params)
  //   .promise()
  //   .then(e => res.status(200).json(e))
  //   .catch(e => res.status(500).json(e))
})

app.get("/getMonster", ({ query: { monsterId }}, res) => {
  documentClient.get({
    TableName: `cryptomon-monsters-${process.env.NODE_ENV}`,
    Key: {
      monsterId
    }
  }).promise()
    .then(data => res.json(data.Item))
    .catch(err => res.error(err))
})

// returns an array of objects ({ clashId, opponent, userTeam, opponentTeam, bonusWinner, result, bet })
// WON, LOST, DRAW
app.get("/listClashes", ({ query: { address, next, limit = 50 } }, res) => {
  // if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return res.status(400).send("Invalid address.")

  const params = {
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
  }

  documentClient.query(params).promise()
    .then(({ Items, Count }) => res.json({ count: Count, clashes: Items }))
    .catch(err => res.error(err))
})

app.get("/battleInfo", ({ queryStringParameters: { eventHash, ExclusiveStartKey } }, res) => {
  if (ExclusiveStartKey) {
    try {
      ExclusiveStartKey = JSON.parse(ExclusiveStartKey)
    } catch (err) {
      return res.status(400).send("Invalid ExclusiveStartKey parameter.")
    }
  }

  const params = {
    TableName: `cryptomon-battles-${env}`,
    IndexName: "hashIndex",
    Limit: paginatorLimit,
    ExclusiveStartKey,
    ExpressionAttributeValues: {
      ":h" : {
        S: eventHash
      }
    },
    KeyConditionExpression: "eventHash = :h"
  }

  dynamodb.query(params)
    .promise()
    .then(e => res.status(200).json(e))
    .catch(e => res.status(500).json(e))
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

exports.handler = (...args) => app.listen(...args)
