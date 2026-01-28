#!/bin/bash

echo "🚀 Deploying QuickLink URL Shortener..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel (if vercel CLI is installed)
    if command -v vercel &> /dev/null; then
        echo "🌐 Deploying to Vercel..."
        vercel --prod
    else
        echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
        echo "📋 Manual deployment steps:"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Login: vercel login"
        echo "3. Deploy: vercel --prod"
    fi
    
    echo "🎉 Deployment complete!"
    echo "💰 Your money-making URL shortener is ready!"
    
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi