import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Initialize the Secrets Manager client
// This will use the AWS credentials provided to your Amplify app
const client = new SecretsManagerClient({
  region: "us-east-1", // Replace with your AWS region
});

/**
 * Retrieves a secret from AWS Secrets Manager
 * 
 * @param {string} secretName - The name/ARN of the secret to retrieve
 * @returns {Promise<string>} The secret value
 */
export async function getSecret(secretName) {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    
    const response = await client.send(command);
    
    // If the secret is a string, return it directly
    if (response.SecretString) {
      return response.SecretString;
    }
    
    // If the secret is binary, decode it
    const buff = Buffer.from(response.SecretBinary, 'base64');
    return buff.toString('utf8');
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Retrieves GitHub OAuth configuration from AWS Secrets Manager
 * 
 * @returns {Promise<Object>} GitHub OAuth configuration
 */
export async function getGitHubOAuthConfig() {
  try {
    // For production, we'll try to get the secrets from AWS Secrets Manager
    // The secret names should match what you create in AWS Secrets Manager
    const clientId = await getSecret("github/oauth/client-id");
    const clientSecret = await getSecret("github/oauth/client-secret");
    
    return {
      clientId,
      clientSecret,
      redirectUri: "https://mprokolo.gr/api/auth/callback"
    };
  } catch (error) {
    console.error("Failed to retrieve GitHub OAuth secrets:", error);
    
    // Only for development/fallback in case the secrets manager fails
    // This should never be used in production
    if (process.env.NODE_ENV !== "production") {
      console.warn("Using non-production fallback values for OAuth configuration");
      return {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        redirectUri: "http://localhost:3000/api/auth/callback"
      };
    }
    
    // In production, fail loudly if we can't access secrets
    throw new Error("Failed to retrieve GitHub OAuth configuration from AWS Secrets Manager");
  }
}