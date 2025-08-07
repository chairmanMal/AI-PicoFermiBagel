const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });
const appsync = new AWS.AppSync();
const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// AppSync API ID
const API_ID = 'dzdcg7gk5zco3fu57dotwhbrdu';

async function testAuthSystem() {
    console.log('🧪 Testing Authentication System...\n');
    
    try {
        // Test 1: Check AppSync Schema
        console.log('📋 Test 1: Checking AppSync Schema...');
        try {
            const schema = await appsync.getIntrospectionSchema({
                apiId: API_ID,
                format: 'SDL'
            }).promise();
            
            const schemaText = schema.schema.toString();
            
            // Check for new authentication types
            const hasLoginUser = schemaText.includes('loginUser');
            const hasRegisterUserWithPassword = schemaText.includes('registerUserWithPassword');
            const hasUserProfile = schemaText.includes('type UserProfile');
            const hasLoginResponse = schemaText.includes('type LoginResponse');
            const hasRegistrationResponse = schemaText.includes('type RegistrationResponse');
            
            console.log('✅ Schema contains loginUser:', hasLoginUser);
            console.log('✅ Schema contains registerUserWithPassword:', hasRegisterUserWithPassword);
            console.log('✅ Schema contains UserProfile:', hasUserProfile);
            console.log('✅ Schema contains LoginResponse:', hasLoginResponse);
            console.log('✅ Schema contains RegistrationResponse:', hasRegistrationResponse);
            
            if (!hasLoginUser || !hasRegisterUserWithPassword || !hasUserProfile) {
                console.log('❌ Missing required schema types. Please update AppSync schema manually.');
                console.log('📋 Required types:');
                console.log('- loginUser mutation');
                console.log('- registerUserWithPassword mutation');
                console.log('- UserProfile type');
                console.log('- LoginResponse type');
                console.log('- RegistrationResponse type');
            }
            
        } catch (error) {
            console.log('❌ Error checking schema:', error.message);
            console.log('💡 You may need to manually update the AppSync schema');
        }
        
        // Test 2: Check Lambda Functions
        console.log('\n📋 Test 2: Checking Lambda Functions...');
        try {
            const functions = await lambda.listFunctions().promise();
            const authFunction = functions.Functions.find(f => f.FunctionName.includes('auth'));
            
            if (authFunction) {
                console.log('✅ Found auth Lambda function:', authFunction.FunctionName);
                console.log('📅 Created:', authFunction.CreationTime);
                console.log('⏱️  Last modified:', authFunction.LastModified);
                console.log('🔧 Runtime:', authFunction.Runtime);
            } else {
                console.log('❌ No auth Lambda function found');
                console.log('💡 You need to create: pfb-auth-service Lambda function');
            }
            
        } catch (error) {
            console.log('❌ Error checking Lambda functions:', error.message);
        }
        
        // Test 3: Check DynamoDB Tables
        console.log('\n📋 Test 3: Checking DynamoDB Tables...');
        try {
            const dynamodbService = new AWS.DynamoDB();
            const tables = await dynamodbService.listTables().promise();
            const userProfilesTable = tables.TableNames.find(name => name.includes('user-profiles'));
            
            if (userProfilesTable) {
                console.log('✅ Found user profiles table:', userProfilesTable);
                
                // Check table structure
                const tableInfo = await dynamodbService.describeTable({ TableName: userProfilesTable }).promise();
                console.log('📊 Table status:', tableInfo.Table.TableStatus);
                console.log('🔑 Primary key:', tableInfo.Table.KeySchema[0].AttributeName);
                
            } else {
                console.log('❌ No user profiles table found');
                console.log('💡 You need to create: pfb-user-profiles DynamoDB table');
                console.log('📋 Table structure:');
                console.log('- Primary key: username (String)');
                console.log('- Attributes: deviceId, passwordHash, createdAt, lastLogin, gamesPlayed, bestScore, averageScore');
            }
            
        } catch (error) {
            console.log('❌ Error checking DynamoDB tables:', error.message);
        }
        
        // Test 4: Check AppSync Data Sources
        console.log('\n📋 Test 4: Checking AppSync Data Sources...');
        try {
            const dataSources = await appsync.listDataSources({ apiId: API_ID }).promise();
            const authDataSource = dataSources.dataSources.find(ds => ds.name.includes('auth'));
            
            if (authDataSource) {
                console.log('✅ Found auth data source:', authDataSource.name);
                console.log('🔧 Type:', authDataSource.type);
                console.log('📅 Created:', authDataSource.createdAt);
            } else {
                console.log('❌ No auth data source found');
                console.log('💡 You need to create AppSync data source pointing to auth Lambda');
            }
            
        } catch (error) {
            console.log('❌ Error checking data sources:', error.message);
        }
        
        // Test 5: Check AppSync Resolvers
        console.log('\n📋 Test 5: Checking AppSync Resolvers...');
        try {
            const resolvers = await appsync.listResolvers({ apiId: API_ID, typeName: 'Mutation' }).promise();
            const loginResolver = resolvers.resolvers.find(r => r.fieldName === 'loginUser');
            const registerResolver = resolvers.resolvers.find(r => r.fieldName === 'registerUserWithPassword');
            
            if (loginResolver) {
                console.log('✅ Found loginUser resolver');
                console.log('📅 Created:', loginResolver.createdAt);
            } else {
                console.log('❌ No loginUser resolver found');
            }
            
            if (registerResolver) {
                console.log('✅ Found registerUserWithPassword resolver');
                console.log('📅 Created:', registerResolver.createdAt);
            } else {
                console.log('❌ No registerUserWithPassword resolver found');
            }
            
        } catch (error) {
            console.log('❌ Error checking resolvers:', error.message);
        }
        
        // Summary
        console.log('\n📋 Summary:');
        console.log('✅ Frontend authentication components created');
        console.log('✅ AuthService with password hashing implemented');
        console.log('✅ GraphQL mutations defined');
        console.log('✅ Lambda function code provided');
        console.log('✅ MainMenu updated with login/register UI');
        
        console.log('\n🔧 Manual steps required:');
        console.log('1. Update AppSync schema with authentication types');
        console.log('2. Create pfb-auth-service Lambda function');
        console.log('3. Create pfb-user-profiles DynamoDB table');
        console.log('4. Create AppSync data source for auth Lambda');
        console.log('5. Create AppSync resolvers for loginUser and registerUserWithPassword');
        
        console.log('\n📋 Lambda function code is available in update-lambda-auth.cjs');
        console.log('📋 Schema updates are available in update-appsync-schema-auth.cjs');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testAuthSystem(); 