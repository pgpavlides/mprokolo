# GitHub OAuth Setup Guide

This is a simple guide for setting up GitHub OAuth in your application.

## 1. GitHub OAuth App Configuration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App or create a new one
3. Configure:
   - **Homepage URL**: `https://mprokolo.gr`
   - **Authorization callback URL**: `https://mprokolo.gr/api/auth/callback`
   - Copy your Client ID and Client Secret

## 2. Update Your Code

The code is already set up with the GitHub OAuth client ID and secret. If you need to change them:

1. Update `app/api/auth/route.js` with your GitHub client ID
2. Update `app/api/auth/callback/route.js` with your GitHub client ID and secret

## 3. Deploy Your Application

Deploy your application to make the changes take effect.

## Troubleshooting

If you encounter authentication issues:

1. Verify your GitHub OAuth app settings match exactly with your code
2. Check that the callback URL is correct and matches what's in GitHub
3. Clear your browser cookies and cache before testing

That's it! This simple approach should work for most GitHub OAuth implementations.