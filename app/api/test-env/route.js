export async function GET(request) {
  // Determine execution environment
  const execEnvironment = {
    isAWS: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    isVercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    host: request.headers.get('host'),
  };

  // Test environment variable access
  const testEnvVars = {
    // Test a simple string value that is unlikely to be restricted
    TEST_STRING: 'test_value',
    
    // Test the setter/getter
    testGetSet: (function() {
      try {
        process.env.TEST_VARIABLE = 'test_value_123';
        return process.env.TEST_VARIABLE === 'test_value_123';
      } catch (error) {
        return `Error: ${error.message}`;
      }
    })(),
    
    // Test actual GitHub credentials presence without revealing values
    hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
    hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    
    // Check if process.env is actually accessible
    envKeysCount: Object.keys(process.env).length,
    canAccessProcessEnv: typeof process.env === 'object',
  };

  // Create response without revealing sensitive data
  const response = {
    timestamp: new Date().toISOString(),
    executionEnvironment: execEnvironment,
    environmentVariableTest: testEnvVars,
    message: 'Use this information to determine if your Lambda function can access environment variables.',
    nextSteps: 'If you see issues with environment variables, check the AWS_ENV_VARIABLES.md guide.',
  };

  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}