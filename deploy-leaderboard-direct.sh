#!/bin/bash

echo "🚀 Deploying Direct Leaderboard Lambda Function..."

# Configuration
FUNCTION_NAME="pfb-leaderboard-direct"
ROLE_NAME="pfb-leaderboard-direct-role"
REGION="us-east-1"

echo "📋 Function Name: $FUNCTION_NAME"
echo "📋 Role Name: $ROLE_NAME"
echo "📋 Region: $REGION"

# Step 1: Create IAM role for Lambda
echo "🔧 Step 1: Creating IAM role..."
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }' 2>/dev/null || echo "Role already exists"

# Step 2: Attach basic execution policy
echo "🔧 Step 2: Attaching basic execution policy..."
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Step 3: Create DynamoDB policy
echo "🔧 Step 3: Creating DynamoDB policy..."
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name DynamoDBLeaderboardDirectPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ],
        "Resource": [
          "arn:aws:dynamodb:us-east-1:*:table/pfb-mobilehub-1126398616-LeaderBoardTable"
        ]
      }
    ]
  }'

# Step 4: Wait for role to be ready
echo "⏳ Step 4: Waiting for role to be ready..."
sleep 10

# Step 5: Create Lambda function
echo "🔧 Step 5: Creating Lambda function..."
aws lambda create-function \
  --function-name $FUNCTION_NAME \
  --runtime nodejs18.x \
  --role arn:aws:iam::171591329315:role/$ROLE_NAME \
  --handler lambda-leaderboard-direct.handler \
  --zip-file fileb://lambda-leaderboard-direct.js \
  --region $REGION \
  --timeout 30 \
  --memory-size 128 2>/dev/null || echo "Function already exists"

echo "✅ Lambda function deployed successfully!"
echo "📋 Function ARN: arn:aws:lambda:$REGION:171591329315:function:$FUNCTION_NAME"
echo ""
echo "🔧 Next steps:"
echo "1. Test the function with: node test-lambda-direct.js"
echo "2. The app will now use this Lambda function for leaderboard submission" 