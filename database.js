const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const env = "staging";

const params = [
  {
    TableName: `cryptomon-monsters-${env}`
  },
  {
    TableName : `cryptomon-monsters-${env}`,
    KeySchema: [
      { AttributeName: "address", KeyType: "HASH"},
      { AttributeName: "tokenId", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "address", AttributeType: "S" },
      { AttributeName: "tokenId", AttributeType: "N" }
    ],
    ProvisionedThroughput: { //TODO Values?
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    },
    GlobalSecondaryIndexes: {
      KeySchema: [
        { AttributeName: "tokenId", KeyType: "HASH" },
        { AttributeName: "address", KeyType: "RANGE"}
      ],
      AttributeDefinitions: [
       { AttributeName: "tokenId", AttributeType: "N" },
       { AttributeName: "address", AttributeType: "S" }
      ],
      ProvisionedThroughput: { //TODO Values?
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  }/*,
  {
    ConsistentRead: false,
    Key: {
      address //TODO check for valid address before?
    },
    TableName: `cryptomon-monsters-${env}`
  }*/
]

dynamodb.updateTable(params[1]).promise().then(console.log);
