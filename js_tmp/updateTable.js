const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const env = "staging";

const params =
  {
    TableName: `cryptomon-monsters-${env}`,
    AttributeDefinitions: [
      {
        AttributeName: 'tokenId',
        AttributeType: "N"
      },
    ],
    GlobalSecondaryIndexUpdates: [
      {
        Create: {
          IndexName: "monsterIdAddress",
          KeySchema: [
            {
              AttributeName: "tokenId",
              KeyType: "HASH"
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          Projection: {
            ProjectionType: "KEYS_ONLY"
          }
        }
      }
    ]
  }


dynamodb.updateTable(params).promise().then(console.log).catch(console.log)
