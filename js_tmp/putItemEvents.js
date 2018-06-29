const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({region: "eu-west-3"});

const params = {
  Item: {
    blockNumber: {
      N: "0"
    }, 
    eventHash: {
      S: "a3aaab"
    }, 
    eventType: {
      S: "Results"
    },
    attacker: {
      S: "0x2"
    },
    defender: {
      S: "0x1"
    },
    team1: {
      NS: ["0", "1", "2", "3", "4"]
    },
    team2: {
      NS: ["5", "6", "7", "8", "9"]
    },
    bonusWinner: {
      N: "1"
    },
    winnerId: {
      N: "1"
    },
    moneyWon: {
      N: "91280"
    }
  }, 
  ReturnConsumedCapacity: "TOTAL", 
  TableName: `cryptomon-events-staging`
};

dynamodb.putItem(params)
  .promise()
  .then(console.log)
  .catch(console.error);

