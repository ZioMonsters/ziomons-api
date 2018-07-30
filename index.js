const Valkyrie = require("aws-valkyrie");
const app = new Valkyrie();
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({ region: "eu-west-3" });
const pkg = require('./package.json');

const env = "staging";
const paginatorLimit = 32;

//body parser middleware; it will become an external module;
app.use((req, res, next) => {
  try {
    if (req.get("content-type").toLowerCase().includes("application/json")) {
      req.body = JSON.parse(req.body);
    }
  }
  catch (ignore) {}
  next();
});

//Used to prevent errors when trying to destructure queryStringParameters from lambda
app.use((req, res, next) => {
  if (!req.queryStringParameters)
    req.queryStringParameters = {};
  next();
});

app.get("/home", (req, res) => res.send("This is cryptomon"));

app.get('/info', (req, res) => res.json(pkg));

app.get("/monstersOfAddress", ({queryStringParameters: { address, ExclusiveStartKey }}, res) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return res.status(400).send("Invalid address parameter.");

  if (ExclusiveStartKey) {
    try {
      ExclusiveStartKey = JSON.parse(ExclusiveStartKey)
    } catch (err) {
      return res.status(400).send("Invalid ExclusiveStartKey parameter.")
    }
  }

  const params = {
    TableName: `cryptomon-monsters-${env}`,
    Limit: paginatorLimit,
    ExclusiveStartKey,
    ExpressionAttributeValues: {
      ":a" : {
        S: address.substr(2)
      }
    },
    KeyConditionExpression: "address = :a"
  };

  dynamodb.query(params)
    .promise()
    .then(e => res.status(200).json(e))
    .catch(e => res.status(500).json(e));
});

app.get("/battlesOfAddress", ({queryStringParameters: {address, ExclusiveStartKey}}, res) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return res.status(400).send("Invalid address.");

  if (ExclusiveStartKey) {
    try {
      ExclusiveStartKey = JSON.parse(ExclusiveStartKey)
    } catch (err) {
      return res.status(400).send("Invalid ExclusiveStartKey parameter.")
    }
  }

  const params = {
    TableName: `cryptomon-events-${env}`,
    IndexName: "EventTypeResults",
    ExclusiveStartKey,
    //Limit: paginatorLimit, //warning: Limit is applied before filtering. removed for now.
    ExpressionAttributeValues: {
      ":e": { S: "Results" },
      ":a": { S: address.substr(2) }
    },
    KeyConditionExpression: "eventType = :e",
    FilterExpression: ":a IN (attacker, defender)"
  };

  dynamodb.query(params)
    .promise()
    .then(e => res.status(200).json(e))
    .catch(e => res.status(500).json(e));
});

app.get("/monstersInSale", ({queryStringParameters: {ExclusiveStartKey}}, res) => {
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
  };

  dynamodb.scan(params)
    .promise()
    .then(e => res.status(200).json(e))
    .catch(e => res.status(500).json(e));
});

app.all("*", (req, res) => res.sendStatus(404));

exports.handler = (...args) => app.listen(...args);
