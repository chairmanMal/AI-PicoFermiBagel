// Corrected AppSync Response Function (no try/catch allowed)
export function response(ctx) {
    console.log('AppSync received:', JSON.stringify(ctx.result));
    
    // Handle different response structures
    let response = ctx.result;
    
    // If it's a string, try to parse it (without try/catch)
    if (typeof response === 'string') {
        // Use JSON.parse directly - if it fails, it will throw and AppSync will handle it
        response = JSON.parse(response);
    }
    
    // Ensure required fields exist
    if (!response.playersWaiting) {
        response.playersWaiting = 0;
    }
    
    console.log('AppSync returning:', JSON.stringify(response));
    return response;
} 