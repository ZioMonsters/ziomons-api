const Valkyrie = require("aws-valkyrie");
const app = new Valkyrie();
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});
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

app.get("/", (req, res) => res.send("this is cryptomon"));

app.get('/info', (req, res) => res.json(pkg));

app.get("/monstersOfAddress", ({queryStringParameters: {address}}, res) => {
  if (!address) return res.sendStatus(400);

  const params = {
    TableName: `cryptomon-monsters-${env}`,
    ExpressionAttributeValues: {
      ":a" : {
        S: address
      }
    },
    KeyConditionExpression: "address = :a"
  };

  dynamodb.query(params)
    .promise()
    .then(e => res.status(200).json(e))
    .catch(e => rgcm es.status(500).json(e));
});



app.all("*", (req, res) => res.sendStatus(404));

exports.handler = (...args) => app.listen(...args);
