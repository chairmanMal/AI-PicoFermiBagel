// Correct getLobbyStatus Resolver Templates for AppSync

// REQUEST MAPPING TEMPLATE (JavaScript):
export function request(ctx) {
  return {
    version: "2018-05-29",
    operation: "Invoke",
    payload: {
      operation: "getLobbyStatus",
      input: ctx.args.input
    }
  };
}

// RESPONSE MAPPING TEMPLATE (JavaScript):
export function response(ctx) {
  if (ctx.error) {
    // Use extensions.error instead of util.error in JavaScript resolvers
    return {
      ...ctx.error,
      errorType: ctx.error.type || "UnknownError",
      message: ctx.error.message || "An error occurred"
    };
  }
  
  // Return the Lambda result directly
  return ctx.result;
} 