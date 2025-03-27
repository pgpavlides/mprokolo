# Setting Up AWS SSM Parameters for OAuth Secrets

This guide provides instructions for setting up AWS Systems Manager (SSM) Parameter Store to securely manage your GitHub OAuth secrets. This is a production-grade approach that eliminates the need to hardcode secrets or use environment variables in AWS Amplify.

## Why Use AWS SSM Parameter Store?

1. **Security**: Parameters are encrypted at rest using AWS KMS
2. **Access Control**: Fine-grained IAM permissions for parameter access
3. **Versioning**: Track changes to parameters over time
4. **Integration**: Native integration with AWS services
5. **Auditability**: Changes to parameters are logged in AWS CloudTrail

## Step 1: Create the Parameters in AWS SSM

1. Sign in to the AWS Management Console
2. Navigate to the Systems Manager service
3. In the left navigation pane, select "Parameter Store"
4. Create two parameters:

### For GitHub Client ID

- Click "Create parameter"
- Name: `/mprokolo/github/client-id`
- Description: "GitHub OAuth Client ID"
- Tier: Standard
- Type: String
- Data type: text
- Value: `Ov23liHUvWs884aAKKrv` (your GitHub OAuth client ID)
- Click "Create parameter"

### For GitHub Client Secret

- Click "Create parameter"
- Name: `/mprokolo/github/client-secret`
- Description: "GitHub OAuth Client Secret"
- Tier: Standard
- Type: SecureString (important for secrets!)
- KMS Key Source: aws/ssm (default)
- Value: `YOUR_GITHUB_CLIENT_SECRET`
- Click "Create parameter"

## Step 2: Configure IAM Permissions

Your AWS Amplify app needs permissions to access these parameters. Create or update the IAM role used by your Amplify app:

1. Navigate to IAM in the AWS console
2. Find the role used by your Amplify app (usually named something like `amplify-YourAppName-Role`)
3. Add a new inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": [
        "arn:aws:ssm:YOUR_REGION:YOUR_ACCOUNT_ID:parameter/mprokolo/github/client-id",
        "arn:aws:ssm:YOUR_REGION:YOUR_ACCOUNT_ID:parameter/mprokolo/github/client-secret"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": [
        "arn:aws:kms:YOUR_REGION:YOUR_ACCOUNT_ID:key/YOUR_KMS_KEY_ID"
      ]
    }
  ]
}
```

Replace:
- `YOUR_REGION` with your AWS region (e.g., `us-east-1`)
- `YOUR_ACCOUNT_ID` with your AWS account ID
- `YOUR_KMS_KEY_ID` with the ID of the KMS key used for encryption (if using the default SSM key, this is usually specific to your account)

## Step 3: Update Your Amplify Build Settings

1. In the Amplify console, navigate to your app
2. Go to "Build settings"
3. Make sure your app has the necessary environment variables:
   - Add `AWS_REGION` with the value of your AWS region (e.g., `us-east-1`)

## Step 4: Deploy Your Application

1. Push the changes to your GitHub repository
2. Trigger a build in AWS Amplify

## Troubleshooting

If you encounter issues accessing parameters:

1. **Check CloudWatch Logs**: Look for error messages in your application logs
2. **Verify IAM Permissions**: Make sure your Amplify app's IAM role has the correct permissions
3. **Parameter Names**: Ensure the parameter names in your code match exactly what you created in SSM
4. **Region**: Make sure you're using the same AWS region for SSM and your Amplify app

## Security Best Practices

1. **Use SecureString for secrets**: Always use the SecureString type for sensitive data
2. **Limit IAM permissions**: Grant only the necessary permissions to your Amplify role
3. **Implement parameter paths**: Use a consistent path structure (e.g., `/mprokolo/github/...`) for organization
4. **Rotate secrets regularly**: Update your GitHub OAuth secrets periodically

## Monitoring and Maintenance

1. **Enable CloudTrail**: Monitor parameter access and changes
2. **Set up notifications**: Configure notifications for parameter changes
3. **Regularly review access**: Periodically review who has access to your parameters
4. **Check parameter versions**: Review parameter versions to track changes

By following this guide, you'll have a secure, scalable, and production-grade solution for managing your GitHub OAuth secrets in AWS Amplify.