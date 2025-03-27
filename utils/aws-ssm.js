import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// Cache for parameter values to avoid multiple API calls for the same parameter
const parameterCache = new Map();

/**
 * Retrieves a parameter from AWS Systems Manager Parameter Store
 * This is a production-grade solution that follows AWS best practices for secret management
 * 
 * @param {string} parameterName - The name of the parameter to retrieve
 * @param {boolean} withDecryption - Whether to decrypt the parameter (for SecureString parameters)
 * @returns {Promise<string>} The parameter value
 */
export async function getParameter(parameterName, withDecryption = true) {
  // Check if parameter is already in cache
  const cacheKey = `${parameterName}:${withDecryption}`;
  if (parameterCache.has(cacheKey)) {
    return parameterCache.get(cacheKey);
  }

  try {
    // Initialize the SSM client
    const client = new SSMClient({
      region: process.env.AWS_REGION || "us-east-1", // Use AWS_REGION from environment or default to us-east-1
    });

    // Create the GetParameter command
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: withDecryption,
    });

    // Send the command to retrieve the parameter
    const response = await client.send(command);
    
    // Cache the parameter value
    parameterCache.set(cacheKey, response.Parameter.Value);
    
    return response.Parameter.Value;
  } catch (error) {
    console.error(`Error retrieving parameter ${parameterName}:`, error);
    
    // Only in development, allow fallbacks
    if (process.env.NODE_ENV === "development") {
      // For local development, provide fallbacks based on environment variables
      if (parameterName.includes("GITHUB_CLIENT_ID")) {
        return process.env.GITHUB_CLIENT_ID || "local-dev-client-id";
      }
      if (parameterName.includes("GITHUB_CLIENT_SECRET")) {
        return process.env.GITHUB_CLIENT_SECRET || "";
      }
    }
    
    // In production, fail gracefully with an error
    throw new Error(`Failed to retrieve parameter ${parameterName} from AWS SSM`);
  }
}

/**
 * Gets GitHub OAuth configuration using AWS SSM Parameter Store
 * This is the production-grade approach for managing secrets in AWS
 * 
 * @returns {Promise<Object>} GitHub OAuth configuration
 */
export async function getGitHubOAuthConfig() {
  try {
    // Parameter names should match what you create in AWS SSM Parameter Store
    // Use a consistent pattern like /mprokolo/github/client-id and /mprokolo/github/client-secret
    const parameterPrefix = "/mprokolo"; // Customize this for your application
    
    // For production, we'll try to get the secrets from AWS SSM
    const clientId = await getParameter(`${parameterPrefix}/github/client-id`);
    const clientSecret = await getParameter(`${parameterPrefix}/github/client-secret`);
    
    // Make sure we have both parameters
    if (!clientId || !clientSecret) {
      throw new Error("Missing GitHub OAuth parameters in AWS SSM");
    }
    
    return {
      clientId,
      clientSecret,
      redirectUri: "https://mprokolo.gr/api/auth/callback"
    };
  } catch (error) {
    console.error("Failed to retrieve GitHub OAuth config from AWS SSM:", error);
    
    // Only in development, provide fallbacks
    if (process.env.NODE_ENV === "development") {
      console.warn("Using local development fallbacks for OAuth configuration");
      return {
        clientId: process.env.GITHUB_CLIENT_ID || "Ov23liHUvWs884aAKKrv",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        redirectUri: "http://localhost:3000/api/auth/callback"
      };
    }
    
    // In production, propagate the error
    throw error;
  }
}
