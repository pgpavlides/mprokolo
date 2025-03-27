/**
 * Utility to handle environment variables and secrets in an Amplify environment
 * This provides a fallback mechanism to handle Amplify's specific behavior
 */

// Store hardcoded values only for non-sensitive data
const CONFIG = {
  // Public non-sensitive values that can be hardcoded safely
  GITHUB_CLIENT_ID: 'Ov23liEYl3sJa1JMlomB',
  NEXT_PUBLIC_APP_URL: 'https://mprokolo.gr',
  
  // DO NOT hardcode sensitive values like client secrets here
  // This is just a "last resort" fallback mechanism
};

/**
 * Gets a configuration value safely, with appropriate logging
 * @param {string} key - The environment variable key to retrieve
 * @param {boolean} isSensitive - Whether this is sensitive data (affects logging)
 * @returns {string|null} The configuration value or null if not found
 */
export function getConfig(key, isSensitive = false) {
  try {
    // First try process.env
    if (process.env[key]) {
      if (!isSensitive) {
        console.log(`Using ${key} from environment variables`);
      } else {
        console.log(`Found sensitive value for ${key} in environment variables`);
      }
      return process.env[key];
    }
    
    // Then try hardcoded config for non-sensitive data
    if (!isSensitive && CONFIG[key]) {
      console.log(`Using hardcoded fallback for ${key} (non-sensitive)`);
      return CONFIG[key];
    }
    
    // For sensitive data, never use hardcoded values
    if (isSensitive) {
      console.error(`Missing sensitive environment variable: ${key}`);
      return null;
    }
    
    // Not found anywhere
    console.warn(`Configuration value not found: ${key}`);
    return null;
  } catch (error) {
    console.error(`Error accessing configuration value ${key}:`, error);
    return null;
  }
}

/**
 * Gets GitHub OAuth configuration
 * @returns {Object} GitHub OAuth configuration
 */
export function getGitHubConfig() {
  return {
    clientId: getConfig('GITHUB_CLIENT_ID', false),
    clientSecret: getConfig('GITHUB_CLIENT_SECRET', true),
    redirectUri: `${getConfig('NEXT_PUBLIC_APP_URL', false)}/api/auth/callback`,
  };
}
