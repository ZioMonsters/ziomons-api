const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const env = "staging";


const params = {
  Item: {
   "address": {
     S: "AAAAAAAA"
    }, 
   "tokenId": {
      N: "1"
    }, 
   "atk": {
      N: "18"
   	},
    "def": {
      N: "17"
    },
    "spd": {
      N: "19"
    },
    "lvl": {
      N: "100"
    },
    "exp": {
      N: "18000"
    }
  }, 
  ReturnConsumedCapacity: "TOTAL", 
  TableName: `cryptomon-monsters-${env}`
};

dynamodb.putItem(params)
  .promise()
  .then(console.log)
  .catch(console.error);

