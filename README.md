# ModelVault

A sleek, private image gallery for model content with AI image generation. Supports both SFW and NSFW content.

## Features

- 📷 Upload and organize model images (SFW / NSFW)
- 🤖 AI image generation from text descriptions (Hugging Face FLUX.1)
- 🏷️ Tag and filter images
- 🔒 Fully client-side — images stay in your browser's storage

## Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Push these files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to repo **Settings → Pages**
4. Under "Branch", select `main` and `/ (root)`, click Save
5. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO`

## API Key (Optional)

The app uses Hugging Face's free inference API. It works without a key but is rate-limited. For better results:

1. Sign up at [huggingface.co](https://huggingface.co)
2. Generate a token at `Settings → Access Tokens`
3. Paste it in the app under **AI Generator → API Setup**
