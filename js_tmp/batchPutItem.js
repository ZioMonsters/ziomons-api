const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const env = "staging";


const params = {
  RequestItems: { 
    "cryptomon-monsters-staging" : [ 
      { 
        PutRequest: { 
          Item: { 
            address: {S: "AAAAAA"},
            tokenId: {N: "4"}
          }
        }
      },
      { 
        PutRequest: { 
          Item: { 
            address: {S: "AAAAAA"},
            tokenId: {N: "3"}
          }
        }
      }
    ]
  }
}

dynamodb.batchWriteItem(params)
  .promise()
  .then(e => console.log(`DATA: ${e}`))
  .catch(console.error);

