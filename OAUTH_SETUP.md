# GitHub OAuth Setup Guide

## Problem
You encountered this error:
```
Be careful!
The `redirect_uri` is not associated with this application.
The application might be misconfigured or could be trying to redirect you to a website you weren't expecting.
```

This happens when the redirect URI in your GitHub OAuth application settings doesn't match the one your application is using.

## Solution

### 0. AWS Environment Configuration

If you're deploying to AWS, make sure to properly set your environment variables in the AWS console:

1. Go to your AWS Lambda function configuration
2. Find the "Environment variables" section
3. Add the following variables:
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth App client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App client secret
   - `NODE_ENV`: Set to `production`

**Important:** Double-check these variables are actually set in your production environment. You can visit `/api/debug-env` on your deployed site to verify what environment variables are available (remove this endpoint before final deployment for security).

### 1. GitHub OAuth App Configuration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App or create a new one
3. Configure the following:
   - **Homepage URL**: Your application URL (e.g., `https://mprokolo.gr` or `http://localhost:3000` for local development)
   - **Authorization callback URL**: This must match your application's redirect URI:
     - For production: `https://mprokolo.gr/api/auth/callback`
     - For local development: `http://localhost:3000/api/auth/callback`

### 2. Environment Variables

1. Create a `.env.local` file in the root of your project
2. Copy the content from `.env.local.example`
3. Replace with your actual GitHub OAuth credentials:
   ```
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   NEXT_PUBLIC_APP_URL=https://mprokolo.gr  # or http://localhost:3000 for local dev
   ```

### 3. Verifying Your Setup

The application now dynamically determines the correct redirect URI based on the host header, so it should work correctly in both local and production environments.

### 4. Testing

1. After making these changes, restart your Next.js application
2. Try the GitHub login again
3. Monitor server logs for any errors

## Important Notes

- Make sure your application has the correct scopes (`repo,read:user,read:org`)
- Keep your client secret secure and never commit it to the repository
- For local development, you may need to create a separate GitHub OAuth App