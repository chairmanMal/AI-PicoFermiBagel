#!/bin/bash

echo "🔍 Finding Lambda execution roles..."

# List all roles and filter for Lambda-related ones
aws iam list-roles --query 'Roles[?contains(RoleName, `lambda`) || contains(RoleName, `Lambda`) || contains(RoleName, `pfb`)].{RoleName:RoleName,Arn:Arn}' --output table

echo ""
echo "🔍 Checking for existing Lambda functions to see what role they use..."

# List Lambda functions and their roles
aws lambda list-functions --query 'Functions[].{FunctionName:FunctionName,Role:Role}' --output table

echo ""
echo "🎯 If you see a role like 'pfb-lambda-role' or similar, we can use that."
echo "Otherwise, we'll need to create a new role or use the AWS managed role." 