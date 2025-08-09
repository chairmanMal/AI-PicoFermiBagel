export function request(ctx) {
  console.log('🎮 sendHeartbeat request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'sendHeartbeat',
      input: ctx.args.input
    }
  };
}
export function response(ctx) {
  console.log('🎮 sendHeartbeat response:', JSON.stringify(ctx.result, null, 2));
  
  return ctx.result;
}