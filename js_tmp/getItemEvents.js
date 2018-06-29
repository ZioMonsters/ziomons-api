const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const env = "staging";


const params = {
	TableName: "cryptomon-events-staging",
  IndexName: "EventTypeResults",
    ExpressionAttributeValues: {
    	":e": { S: "Results" },
      ":a": { S: "0x2" }
    },
    KeyConditionExpression: "eventType = :e",
    FilterExpression: ":a IN (attacker, defender)"
  };

dynamodb.query(params)
  .promise()
  .then(e => console.log(e))
  .catch(console.error);

