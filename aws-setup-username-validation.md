# AWS Username Validation Implementation Guide

## 1. DynamoDB Table Setup

### Create Table: `pfb-usernames`
```bash
aws dynamodb create-table \
  --table-name pfb-usernames \
  --attribute-definitions \
    AttributeName=username,AttributeType=S \
    AttributeName=deviceId,AttributeType=S \
  --key-schema \
    AttributeName=username,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=deviceId-index,KeySchema=[{AttributeName=deviceId,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST
```

### Table Structure:
```json
{
  "username": "string",           // Primary key - the username
  "deviceId": "string",           // Device that registered this username
  "registeredAt": "string",       // ISO timestamp
  "lastUsedAt": "string",         // ISO timestamp
  "isActive": "boolean"           // Whether username is currently in use
}
```

## 2. AppSync Schema Updates

### Add to your GraphQL schema:
```graphql
input UsernameValidationInput {
  username: String!
  timestamp: String!
}

type UsernameValidationResponse {
  available: Boolean!
  message: String!
  suggestions: [String!]!
}

type Mutation {
  validateUsername(input: UsernameValidationInput!): UsernameValidationResponse!
}
```

## 3. Lambda Function: `pfb-validateUsername`

### Create the Lambda function:
```bash
aws lambda create-function \
  --function-name pfb-validateUsername \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/pfb-lambda-role \
  --handler index.handler \
  --zip-file fileb://validateUsername.zip
```

### Lambda Code (`validateUsername.js`):
```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const { username } = event.arguments.input;
    
    if (!username || username.trim() === '') {
      return {
        available: false,
        message: 'Username cannot be empty',
        suggestions: []
      };
    }
    
    // Check username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        available: false,
        message: 'Username must be 3-20 characters, letters, numbers, hyphens, and underscores only',
        suggestions: []
      };
    }
    
    // Check if username exists in DynamoDB
    const params = {
      TableName: 'pfb-usernames',
      Key: {
        username: username.toLowerCase()
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (result.Item) {
      // Username exists, generate suggestions
      const suggestions = generateSuggestions(username);
      return {
        available: false,
        message: 'Username is already taken',
        suggestions: suggestions
      };
    }
    
    // Username is available
    return {
      available: true,
      message: 'Username is available',
      suggestions: []
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      available: false,
      message: 'Validation failed due to server error',
      suggestions: []
    };
  }
};

function generateSuggestions(username) {
  const suggestions = [];
  const base = username.toLowerCase();
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${base}${i}`);
  }
  
  // Add common suffixes
  const suffixes = ['_', '1', '2', '2024', 'gamer', 'player'];
  suffixes.forEach(suffix => {
    suggestions.push(`${base}${suffix}`);
  });
  
  return suggestions.slice(0, 5); // Return max 5 suggestions
}
```

## 4. AppSync Resolver Setup

### Request Mapping Template:
```vtl
{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "arguments": $util.toJson($ctx.arguments),
    "identity": $util.toJson($ctx.identity)
  }
}
```

### Response Mapping Template:
```vtl
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end

$util.toJson($ctx.result)
```

## 5. IAM Permissions

### Add to your Lambda role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/pfb-usernames",
        "arn:aws:dynamodb:*:*:table/pfb-usernames/index/*"
      ]
    }
  ]
}
```

## 6. Update Existing registerUser Lambda

### Modify your existing `pfb-registerUser` Lambda to also save to usernames table:
```javascript
// Add this to your existing registerUser Lambda after successful registration
const usernameParams = {
  TableName: 'pfb-usernames',
  Item: {
    username: username.toLowerCase(),
    deviceId: deviceId,
    registeredAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    isActive: true
  }
};

await dynamodb.put(usernameParams).promise();
```

## 7. Testing Commands

### Test DynamoDB table creation:
```bash
aws dynamodb describe-table --table-name pfb-usernames
```

### Test Lambda function directly:
```bash
aws lambda invoke \
  --function-name pfb-validateUsername \
  --payload '{"arguments":{"input":{"username":"testuser","timestamp":"2024-01-01T00:00:00Z"}}}' \
  response.json
```

### Test via AppSync:
```bash
# Use the test-appsync-direct.js script with this mutation:
mutation ValidateUsername($input: UsernameValidationInput!) {
  validateUsername(input: $input) {
    available
    message
    suggestions
  }
}
```

## 8. Deployment Steps

1. **Create DynamoDB table** using the command above
2. **Create Lambda function** with the provided code
3. **Update AppSync schema** with the new mutation
4. **Create AppSync resolver** for validateUsername
5. **Update IAM permissions** for the Lambda role
6. **Modify existing registerUser Lambda** to save usernames
7. **Test the implementation** using the provided commands

## 9. Error Handling

- **Network errors** → Return appropriate error messages
- **Invalid usernames** → Validate format and length
- **Duplicate usernames** → Generate helpful suggestions
- **DynamoDB errors** → Log and return generic error message

## 10. Monitoring

### CloudWatch Logs:
```bash
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/pfb-validateUsername"
```

### DynamoDB Metrics:
- Monitor read/write capacity
- Check for throttling events
- Monitor table size and growth 