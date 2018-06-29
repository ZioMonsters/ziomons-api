const Valkyrie = require("aws-valkyrie");
const app = new Valkyrie();
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({ region: "eu-west-3" });
const pkg = require('./package.json');

const env = "staging";

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

app.get("/home", (req, res) => res.send("this is cryptomon"));

app.get('/info', (req, res) => res.json(pkg));

app.get("/monstersOfAddress", ({queryStringParameters: {address}}, res) => {
  if (!/^0x[a-fA-F0-9]{40}$/g.test(address)) return res.status(400).send("Malformed address.");

  const params = {
    TableName: `cryptomon-monsters-${env}`,
    ExpressionAttributeValues: {
      ":a" : {
        S: address.substr(2)
      }
    },
    KeyConditionExpression: "address = :a"
  };

  dynamodb.query(params)
    .promise()
    .then(({Items}) => res.status(200).json(Items))
    .catch(e => res.status(500).json(e));
});

app.get("/battlesOfAddress", ({queryStringParameters: {address}}, res) => {
  if (!/^0x[a-fA-F0-9]{40}$/g.test(address)) return res.status(400).send("Malformed address.");

  const params = {
    TableName: `cryptomon-events-${env}`,
    IndexName: "EventTypeResults",
    ExpressionAttributeValues: {
      ":e": { S: "Results" },
      ":a": { S: address.substr(2) }
    },
    KeyConditionExpression: "eventType = :e",
    FilterExpression: ":a IN (attacker, defender)"
  };

  dynamodb.query(params)
    .promise()
    .then(({Items}) => res.status(200).json(Items))
    .catch(e => res.status(500).json(e));
});

app.get("/monstersInSale", (req, res) => {
  //TODO
});

app.all("*", (req, res) => res.sendStatus(404));

exports.handler = (...args) => app.listen(...args);
