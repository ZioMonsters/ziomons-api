const Valkyrie = require("aws-valkyrie");
const app = new Valkyrie();
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();
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
    ConsistentRead: false,
    Key: {
      address //TODO check for valid address before?
    },
    TableName: `cryptomon-monsters-${env}`
  };

  dynamodb.getItem(params)
    .promise()
    .then(console.log)
    .catch(console.error);
});

app.all("*", (req, res) => res.sendStatus(404));

exports.handler = (...args) => app.listen(...args);
