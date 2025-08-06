const { CloudWatchLogsClient, DescribeLogGroupsCommand, FilterLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

const logs = new CloudWatchLogsClient({ region: 'us-east-1' });

async function checkLambdaLogs() {
  console.log('🔍 Checking Lambda function logs...\n');
  
  try {
    // Get the log group name
    const logGroupName = '/aws/lambda/pfb-leaderboard-v2';
    
    console.log('📋 Getting recent log events...');
    
    const response = await logs.send(new FilterLogEventsCommand({
      logGroupName: logGroupName,
      startTime: Date.now() - (5 * 60 * 1000), // Last 5 minutes
      limit: 10
    }));
    
    console.log('📋 Recent log events:');
    response.events.forEach((event, index) => {
      console.log(`${index + 1}. ${new Date(event.timestamp).toISOString()}: ${event.message}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking logs:', error.message);
  }
}

checkLambdaLogs(); 