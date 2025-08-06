#!/bin/bash

# Deploy Username Validation Components
# This script helps deploy the AWS components for username validation

set -e

echo "🚀 Deploying Username Validation Components..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI and credentials verified"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
echo "📋 Account ID: $ACCOUNT_ID"
echo "🌍 Region: $REGION"

# Step 1: Create DynamoDB table
echo ""
echo "1. Creating DynamoDB table..."

# Check if table already exists
if aws dynamodb describe-table --table-name pfb-usernames --region $REGION &>/dev/null; then
    echo "✅ DynamoDB table pfb-usernames already exists"
else
    # Create the GSI configuration JSON
    cat > gsi-config.json << EOF
[
  {
    "IndexName": "deviceId-index",
    "KeySchema": [
      {
        "AttributeName": "deviceId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    }
  }
]
EOF

    aws dynamodb create-table \
      --table-name pfb-usernames \
      --attribute-definitions \
        AttributeName=username,AttributeType=S \
        AttributeName=deviceId,AttributeType=S \
      --key-schema \
        AttributeName=username,KeyType=HASH \
      --global-secondary-indexes file://gsi-config.json \
      --billing-mode PAY_PER_REQUEST \
      --region $REGION

    echo "⏳ Waiting for table to be created..."
    aws dynamodb wait table-exists --table-name pfb-usernames --region $REGION
    echo "✅ DynamoDB table created"
fi

# Step 2: Create Lambda function
echo ""
echo "2. Creating Lambda function..."

# Check if Lambda function already exists
if aws lambda get-function --function-name pfb-validateUsername --region $REGION &>/dev/null; then
    echo "✅ Lambda function pfb-validateUsername already exists"
    echo "   Updating function code..."
else
    echo "   Creating new Lambda function..."
fi

# Create the Lambda code file
cat > validateUsername.js << 'EOF'
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
EOF

# Create deployment package
zip -r validateUsername.zip validateUsername.js

# Create or update Lambda function
if aws lambda get-function --function-name pfb-validateUsername --region $REGION &>/dev/null; then
    # Update existing function
    aws lambda update-function-code \
      --function-name pfb-validateUsername \
      --zip-file fileb://validateUsername.zip \
      --region $REGION
    echo "✅ Lambda function updated"
else
    # Create new function with AWS managed role
    aws lambda create-function \
      --function-name pfb-validateUsername \
      --runtime nodejs18.x \
      --role arn:aws:iam::aws:role/service-role/AWSLambdaBasicExecutionRole \
      --handler validateUsername.handler \
      --zip-file fileb://validateUsername.zip \
      --region $REGION
    echo "✅ Lambda function created"
fi

# Step 3: Update IAM permissions
echo ""
echo "3. Updating IAM permissions..."

# Create policy document
cat > username-validation-policy.json << EOF
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
        "arn:aws:dynamodb:$REGION:$ACCOUNT_ID:table/pfb-usernames",
        "arn:aws:dynamodb:$REGION:$ACCOUNT_ID:table/pfb-usernames/index/*"
      ]
    }
  ]
}
EOF

# Attach policy to Lambda role
aws iam put-role-policy \
  --role-name pfb-lambda-role \
  --policy-name UsernameValidationPolicy \
  --policy-document file://username-validation-policy.json

echo "✅ IAM permissions updated"

# Step 4: Test the implementation
echo ""
echo "4. Testing the implementation..."

# Test Lambda function
aws lambda invoke \
  --function-name pfb-validateUsername \
  --payload '{"arguments":{"input":{"username":"testuser","timestamp":"2024-01-01T00:00:00Z"}}}' \
  response.json \
  --region $REGION

echo "✅ Lambda function test completed"

# Cleanup
rm -f validateUsername.js validateUsername.zip username-validation-policy.json response.json gsi-config.json

echo ""
echo "🎉 Username validation deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update your AppSync schema with the validateUsername mutation"
echo "2. Create the AppSync resolver for validateUsername"
echo "3. Update your existing registerUser Lambda to save usernames"
echo "4. Test the frontend integration"
echo ""
echo "To test the implementation, run:"
echo "node test-username-validation.js" 