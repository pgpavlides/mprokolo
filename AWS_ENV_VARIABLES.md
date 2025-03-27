## AWS Lambda Environment Variable Troubleshooting

Your environment debug output showed that your GitHub OAuth credentials are not being correctly passed to your application in AWS Lambda. Here's a comprehensive guide to troubleshooting and fixing this issue.

### Recent AWS Lambda Environment Variable Issues

In recent months, some AWS Lambda users have reported issues with environment variables not being correctly passed to Next.js applications. This appears to be related to how Next.js middleware and Lambda function handlers interact.

**Key troubleshooting steps:**

1. **Lambda Function Configuration vs. Lambda Function URL Configuration**
   - Environment variables need to be set in *both* the main Lambda function configuration *and* any Function URL configurations
   - Check if you need to set the variables in multiple places

2. **Lambda@Edge and CloudFront**
   - If using Lambda@Edge with CloudFront, environment variables work differently
   - For Lambda@Edge, you must include environment variables during deployment

1. **Access the Lambda Function**:
   - Sign in to the AWS Management Console
   - Navigate to the Lambda service
   - Find and select your function

2. **Configure Environment Variables**:
   - Click on the "Configuration" tab
   - Select "Environment variables" from the left sidebar
   - Click "Edit"
   - Add both required variables:
     - Key: `GITHUB_CLIENT_ID`, Value: `your-client-id-here`
     - Key: `GITHUB_CLIENT_SECRET`, Value: `your-client-secret-here`
   - Scroll down and click "Save"

3. **Verify Deployment**:
   - After saving the environment variables, your Lambda function might need to be redeployed
   - If you're using AWS Amplify, check if a new deployment was automatically triggered
   - If not, manually trigger a deployment

## Common Issues and Solutions

### 1. Environment Variables Not Being Passed

**Problem**: Lambda has the variables, but they don't reach your application.

**Solutions**:
- Check the IAM role permissions for your Lambda function
- Ensure your Lambda execution role has the necessary permissions to access environment variables
- Verify that your Lambda function is actually the one being called (sometimes there might be multiple versions)

### 2. Case Sensitivity

**Problem**: Variable names are case-sensitive.

**Solution**:
- Double-check that you've used exactly `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (all uppercase)

### 3. Deployment Issues

**Problem**: New environment variables aren't being included in deployment.

**Solutions**:
- Force a clean redeployment of your Lambda function
- Clear the cache if using CloudFront or other CDN
- If using AWS Amplify, try rebuilding the application from scratch

### 4. CloudFront Cache

**Problem**: Your updated Lambda function is being cached.

**Solution**:
- Create a CloudFront invalidation to clear the cache
- Try accessing with cache-busting query parameters

### 5. Request Origin

**Problem**: Lambda might behave differently based on request origin.

**Solution**:
- Check if your Lambda function is configured with different environment variables for different stages or aliases

## Testing Environment Variables

Continue using the `/api/debug-env` endpoint to verify if your environment variables are being correctly passed to your application after making changes.

## AWS-Specific Resources

- [AWS Lambda Environment Variables Documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)

## Alternative Approaches

If you continue to have issues with environment variables in AWS Lambda, consider these alternatives:

1. **AWS Systems Manager Parameter Store**:
   - Store your secrets in AWS Systems Manager Parameter Store
   - Access them programmatically from your Lambda function

2. **AWS Secrets Manager**:
   - Use AWS Secrets Manager for managing sensitive credentials
   - Retrieve secrets at runtime using the AWS SDK

3. **Lambda Function URL Environment Variables**:
   - If using Lambda Function URLs, ensure environment variables are configured specifically for the function URL

Remember to never hardcode sensitive information like client secrets in your application code for security reasons.