#!/bin/bash

echo "🔍 Checking AWS Permissions and Adding Required Access..."

# Check current permissions
echo "1. Testing current permissions..."

# Test DynamoDB access
echo "   Testing DynamoDB access..."
if aws dynamodb list-tables --region us-east-1 --max-items 1 &>/dev/null; then
    echo "   ✅ Can list DynamoDB tables"
else
    echo "   ❌ Cannot list DynamoDB tables"
fi

# Test Lambda access
echo "   Testing Lambda access..."
if aws lambda list-functions --region us-east-1 --max-items 1 &>/dev/null; then
    echo "   ✅ Can list Lambda functions"
else
    echo "   ❌ Cannot list Lambda functions"
fi

# Test IAM access
echo "   Testing IAM access..."
if aws iam list-roles --max-items 1 &>/dev/null; then
    echo "   ✅ Can list IAM roles"
else
    echo "   ❌ Cannot list IAM roles"
fi

echo ""
echo "2. Creating policy for username validation permissions..."

# Create the policy document
cat > username-validation-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:171591329315:table/pfb-usernames",
        "arn:aws:dynamodb:us-east-1:171591329315:table/pfb-usernames/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:GetFunction",
        "lambda:UpdateFunctionCode",
        "lambda:InvokeFunction",
        "lambda:ListFunctions"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:171591329315:function:pfb-validateUsername"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PutRolePolicy",
        "iam:GetRole",
        "iam:ListRoles"
      ],
      "Resource": [
        "arn:aws:iam::171591329315:role/pfb-lambda-role"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:171591329315:log-group:/aws/lambda/pfb-validateUsername:*"
      ]
    }
  ]
}
EOF

echo "✅ Policy document created: username-validation-policy.json"
echo ""
echo "3. Instructions to add permissions:"
echo ""
echo "You need to add these permissions to your AWS user. Here are your options:"
echo ""
echo "Option A: Ask your AWS administrator to:"
echo "1. Go to AWS Console → IAM → Users → chris@malachowsky.com"
echo "2. Click 'Add permissions'"
echo "3. Choose 'Attach policies directly'"
echo "4. Search for and attach these policies:"
echo "   - AmazonDynamoDBFullAccess"
echo "   - AWSLambda_FullAccess"
echo "   - IAMReadOnlyAccess"
echo ""
echo "Option B: Create a custom policy:"
echo "1. Go to AWS Console → IAM → Policies"
echo "2. Click 'Create policy'"
echo "3. Use JSON tab and paste the content of username-validation-policy.json"
echo "4. Name it 'UsernameValidationPolicy'"
echo "5. Attach it to your user"
echo ""
echo "Option C: Use AWS CLI (if you have admin access):"
echo "aws iam put-user-policy --user-name chris@malachowsky.com --policy-name UsernameValidationPolicy --policy-document file://username-validation-policy.json"
echo ""
echo "After adding permissions, run: ./deploy-username-validation.sh" 