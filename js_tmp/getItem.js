const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const params = {
	TableName: `cryptomon-monsters-staging`
  };

dynamodb.scan(params)
  .promise()
  .then(console.log)
  .catch(console.error);

