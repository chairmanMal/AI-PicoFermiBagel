// Simplest Working getLobbyStatus Resolver Templates for AppSync

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

// RESPONSE MAPPING TEMPLATE (JavaScript) - Simplest Version:
export function response(ctx) {
  // Just return the result - let AppSync handle errors
  return ctx.result;
} 