#!/bin/bash

# Quick setup script to initialize git and prepare for GitHub deployment

echo "🚀 Setting up GitHub deployment..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "⚠️  Warning: .gitignore not found"
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: Voice-to-text phone order system for coffee shops"
    echo "✅ Commit created"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Add the remote (replace YOUR_USERNAME and YOUR_REPO):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo ""
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Then deploy using one of these platforms:"
echo "   - Railway: https://railway.app (recommended)"
echo "   - Render: https://render.com"
echo "   - Heroku: https://heroku.com"
echo ""
echo "See DEPLOY_VIA_GITHUB.md for detailed instructions!"

