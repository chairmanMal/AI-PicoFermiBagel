# AWS Authentication Setup Instructions

## 🔧 **Step 1: Deploy the Lambda Function**

### **1.1 Deploy the Auth Service Lambda**
```bash
# Run the deployment script
node deploy-auth-service.cjs
```

This will:
- Create a deployment package with the Lambda function
- Install AWS SDK dependencies
- Deploy to the existing `pfb-auth-service` Lambda function

### **1.2 Verify Lambda Deployment**
```bash
# Test the Lambda function
aws lambda invoke --function-name pfb-auth-service --payload '{"operation":"test"}' response.json && cat response.json
```

## 🔧 **Step 2: Configure AppSync Resolvers**

### **2.1 Create Data Source for Auth Service**
1. Go to AWS AppSync Console
2. Select your API: `pfb-graphql-api`
3. Go to **Data Sources**
4. Click **Create data source**
5. Configure:
   - **Data source name**: `pfb-auth-service`
   - **Data source type**: Lambda
   - **Region**: `us-east-1`
   - **Lambda function**: `pfb-auth-service`
   - **IAM role**: Use existing role or create new one with Lambda invoke permissions

### **2.2 Create Resolver for `registerUserWithPassword`**
1. Go to **Schema** in AppSync
2. Find the `registerUserWithPassword` mutation
3. Click **Attach** next to the resolver
4. Select **Lambda** as the data source
5. Use this resolver code:

```javascript
export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      operation: 'registerUserWithPassword',
      input: ctx.args.input
    }
  };
}

export function response(ctx) {
  return ctx.result;
}
```

### **2.3 Create Resolver for `loginUser`**
1. Find the `loginUser` mutation
2. Click **Attach** next to the resolver
3. Select **Lambda** as the data source
4. Use this resolver code:

```javascript
export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      operation: 'loginUser',
      input: ctx.args.input
    }
  };
}

export function response(ctx) {
  return ctx.result;
}
```

## 🔧 **Step 3: Update GraphQL Schema**

### **3.1 Add Authentication Types**
Add these types to your AppSync schema:

```graphql
input UserRegistrationWithPasswordInput {
  username: String!
  password: String!
  deviceId: String!
  timestamp: String!
}

input UserLoginInput {
  username: String!
  password: String!
  deviceId: String!
}

type UserProfile {
  username: String!
  deviceId: String!
  createdAt: String!
  lastLogin: String!
  gamesPlayed: Int!
  bestScore: Int!
  averageScore: Float!
}

type RegistrationResult {
  success: Boolean!
  user: UserProfile
  message: String!
  suggestions: [String!]!
}

type LoginResult {
  success: Boolean!
  user: UserProfile
  message: String!
  suggestions: [String!]!
}

type Mutation {
  registerUserWithPassword(input: UserRegistrationWithPasswordInput!): RegistrationResult!
  loginUser(input: UserLoginInput!): LoginResult!
}
```

## 🔧 **Step 4: Configure IAM Permissions**

### **4.1 Lambda Execution Role**
Ensure the `pfb-auth-service` Lambda has these permissions:

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
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/pfb-user-profiles"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:*:*"
    }
  ]
}
```

### **4.2 AppSync Role**
Ensure AppSync can invoke the Lambda:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-1:*:function:pfb-auth-service"
    }
  ]
}
```

## 🔧 **Step 5: Test the Setup**

### **5.1 Test Registration**
```bash
# Test user registration
aws appsync query \
  --api-id YOUR_API_ID \
  --query 'mutation RegisterUser($input: UserRegistrationWithPasswordInput!) { registerUserWithPassword(input: $input) { success message user { username deviceId } } }' \
  --variables '{"input": {"username": "testuser", "password": "testpass", "deviceId": "test-device", "timestamp": "2025-08-07T15:00:00Z"}}'
```

### **5.2 Test Login**
```bash
# Test user login
aws appsync query \
  --api-id YOUR_API_ID \
  --query 'mutation LoginUser($input: UserLoginInput!) { loginUser(input: $input) { success message user { username deviceId } } }' \
  --variables '{"input": {"username": "testuser", "password": "testpass", "deviceId": "test-device"}}'
```

## 🔧 **Step 6: Update Frontend**

The frontend code has been updated to use the new cloud-based authentication. The app will now:

1. **Register users** with passwords stored securely in DynamoDB
2. **Login users** with password verification against cloud-stored hashes
3. **Work across devices** since passwords are stored in the cloud
4. **Provide proper error messages** for authentication failures

## 🔧 **Step 7: Verify DynamoDB Table**

Ensure the `pfb-user-profiles` table exists with:
- **Primary Key**: `username` (String)
- **Attributes**: `deviceId`, `passwordHash`, `createdAt`, `lastLogin`, `gamesPlayed`, `bestScore`, `averageScore`

## 🎯 **Expected Results**

After completing these steps:
- ✅ Users can register with passwords
- ✅ Passwords are stored securely in DynamoDB
- ✅ Users can login from any device
- ✅ Authentication works across devices
- ✅ Proper error handling for invalid credentials

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Lambda deployment fails**: Check AWS CLI permissions
2. **AppSync resolver errors**: Verify Lambda function name and permissions
3. **DynamoDB access denied**: Check IAM roles and table permissions
4. **Schema validation errors**: Ensure all required types are defined

### **Debug Commands:**
```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/pfb-auth-service"

# Test Lambda directly
aws lambda invoke --function-name pfb-auth-service --payload '{"operation":"test"}' response.json

# Check DynamoDB table
aws dynamodb describe-table --table-name pfb-user-profiles
``` 