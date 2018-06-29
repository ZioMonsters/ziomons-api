const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const env = "production";

let params =
  {
    TableName: `cryptomon-events-${env}`,
    AttributeDefinitions: [
      {
        AttributeName: 'eventType',
        AttributeType: "S"
      },
    ],
    GlobalSecondaryIndexUpdates: [
      {
        Delete: {
          IndexName: "EventTypeResults"
        }
      }
    ]
  }

params = {
  TableName: `cryptomon-events-${env}`,
  AttributeDefinitions: [
    {
      AttributeName: 'eventType',
      AttributeType: "S"
    },
  ],
  GlobalSecondaryIndexUpdates: [
    {
      Create: {
        IndexName: "EventTypeResults",
        KeySchema: [
          {
            AttributeName: "eventType",
            KeyType: "HASH"
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        },
        Projection: {
          ProjectionType: "ALL"
        },
      }
    }
  ]
}

dynamodb.updateTable(params).promise().then(console.log).catch(console.log)
