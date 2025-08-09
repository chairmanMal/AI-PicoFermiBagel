// AppSync JavaScript resolvers for real-time subscriptions

// Request resolver for updateDifficultyInterestWithNotification
export function request(ctx) {
  console.log('🎮 Difficulty interest update request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'updateDifficultyInterestWithNotification',
      input: ctx.args.input
    }
  };
}

// Response resolver for updateDifficultyInterestWithNotification
export function response(ctx) {
  console.log('🎮 Difficulty interest update response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}

// Request resolver for joinLobbyWithNotification
export function joinLobbyRequest(ctx) {
  console.log('🎮 Player join lobby request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'joinLobbyWithNotification',
      input: ctx.args.input
    }
  };
}

// Response resolver for joinLobbyWithNotification
export function joinLobbyResponse(ctx) {
  console.log('🎮 Player join lobby response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}

// Request resolver for leaveLobbyWithNotification
export function leaveLobbyRequest(ctx) {
  console.log('🎮 Player leave lobby request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'leaveLobbyWithNotification',
      input: ctx.args.input
    }
  };
}

// Response resolver for leaveLobbyWithNotification
export function leaveLobbyResponse(ctx) {
  console.log('🎮 Player leave lobby response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
}

// Request resolver for startGameWithNotification
export function startGameRequest(ctx) {
  console.log('🎮 Game start request:', JSON.stringify(ctx.args, null, 2));
  
  return {
    operation: 'Invoke',
    payload: {
      operation: 'startGameWithNotification',
      input: ctx.args.input
    }
  };
}

// Response resolver for startGameWithNotification
export function startGameResponse(ctx) {
  console.log('🎮 Game start response:', JSON.stringify(ctx.result, null, 2));
  
  if (ctx.error) {
    throw new Error(ctx.error.message);
  }
  
  return ctx.result;
} 