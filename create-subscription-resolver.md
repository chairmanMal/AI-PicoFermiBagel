# 🔧 Create Subscription Resolver with None Data Source

## Alternative Approach: Manual Resolver

If the @aws_subscribe directive doesn't work, create a manual resolver:

### Step 1: Create None Data Source
1. Go to AWS AppSync Console → **Data Sources**
2. Click **Create data source**
3. Configure:
   - **Data source name**: `NoneDataSource`
   - **Data source type**: `None`
4. Click **Create**

### Step 2: Create Subscription Resolver
1. Go to **Schema** tab
2. Find `Subscription` type → `onDifficultyInterestUpdate` field
3. Click **Attach** resolver
4. Configure resolver:
   - **Data source**: `NoneDataSource`
   - **Request mapping template**:
   ```vtl
   {
     "version": "2017-02-28",
     "payload": {}
   }
   ```
   - **Response mapping template**:
   ```vtl
   #if($ctx.error)
     $util.error($ctx.error.message, $ctx.error.type)
   #end
   $util.toJson($ctx.result)
   ```

### Step 3: Modify Lambda to Publish Subscription
The Lambda function needs to publish to the subscription when updating interest counts.

This requires using AppSync's publish API, which is more complex.

### Recommended: Use Polling Instead
Given the complexity of AppSync subscriptions, implement 5-second polling:
- Simpler implementation
- More reliable
- Still feels real-time for users
- No complex AWS configuration needed

Would you like me to implement the polling approach instead? 