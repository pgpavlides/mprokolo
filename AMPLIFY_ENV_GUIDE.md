# AWS Amplify Environment Variables Guide

Based on the AWS Amplify documentation, this guide addresses the specific way Amplify handles environment variables and how to troubleshoot issues with them.

## Key Points from Amplify Documentation

1. **Environment Variable Scope**: 
   - Variables set in the Amplify console are primarily accessible during the **build process**
   - They are not automatically injected into your application's runtime environment

2. **Next.js Specific Considerations**:
   - For server-side code (API routes), you need special handling for environment variables
   - Amplify treats them differently than traditional Lambda functions

## Solutions for Runtime Environment Variables

### 1. Use the SSR Feature of Amplify

If your Amplify app is using Next.js with server-side rendering, make sure you have the SSR feature enabled in your Amplify settings. This affects how environment variables are passed to your application.

### 2. Use Secrets Management for Sensitive Data (Recommended)

As per the Amplify documentation:

> "Don't use environment variables to store secrets. For a Gen 2 app, use the Secret management feature in the Amplify console."

To use Secrets Management:
1. Go to the Amplify console
2. Navigate to your app
3. Go to "Hosting environments" → "Environment variables"
4. Add your secrets using the Secrets management feature

### 3. Direct Import from Parameter Store

For Gen 1 apps, Amplify recommends using AWS Systems Manager Parameter Store for secrets:

```javascript
import { SSM } from '@aws-sdk/client-ssm';

const getSecrets = async () => {
  const ssm = new SSM({ region: 'your-region' });
  const params = {
    Name: '/amplify/your-app-id/GITHUB_CLIENT_SECRET',
    WithDecryption: true
  };
  const response = await ssm.getParameter(params);
  return response.Parameter.Value;
};
```

### 4. Use Amplify's Runtime Environment Configuration

Next.js applications can use the `getServerSideProps` or API routes to retrieve secrets at runtime:

```javascript
// Server-side only code
import { withSSRContext } from 'aws-amplify';

export async function getServerSideProps(context) {
  const { Auth } = withSSRContext(context);
  // Access secrets here
}
```

## Troubleshooting Environment Variables in Amplify

1. **Check Build Logs**:
   - Environment variables should be visible in build logs (with sensitive values masked)
   - Verify that they're being set correctly during the build phase

2. **Verify SSR Configuration**:
   - Ensure your Next.js app is correctly configured for SSR in Amplify
   - Check the Amplify configuration for your application

3. **Try Explicit Runtime Environment Access**:
   - For API routes, consider adding explicit code to access environment variables
   - Use AWS SDK to fetch secrets directly in critical paths

4. **Rebuild and Redeploy**:
   - After setting environment variables, trigger a new build
   - Some environment variables only take effect after a fresh deployment

## Best Practices for Amplify Environment Variables

1. **Use Environment Variables for Non-Sensitive Build Configuration**:
   - API endpoints
   - Feature flags
   - Configuration options

2. **Use Secrets Management for Sensitive Data**:
   - OAuth client secrets
   - API keys
   - Database credentials

3. **Consider Environment-Specific Variables**:
   - You can set different values per branch in Amplify
   - This allows different configurations for dev/staging/production

## Additional Resources

- [Amplify Documentation on Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Amplify SSR Support for Next.js](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)