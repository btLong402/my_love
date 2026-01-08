# My Love Gallery - Cloudflare R2 Setup

## Prerequisites
- Node.js 18+
- Cloudflare account with R2 enabled

## Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare
```bash
wrangler login
```

## Step 3: Create R2 Bucket (if not exists)
```bash
wrangler r2 bucket create my-love-images
```

## Step 4: Configure Worker
Edit `worker/wrangler.toml`:
```toml
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "YOUR_BUCKET_NAME"  # ← Change this
```

## Step 5: Deploy Worker
```bash
cd worker
npm install
wrangler deploy
```

After deploy, you'll get a URL like:
```
https://my-love-r2-worker.<your-subdomain>.workers.dev
```

## Step 6: Configure Frontend
1. Open `http://localhost:8080?admin=true`
2. Paste Worker URL in settings
3. Start uploading images!

## Security Notes
- ⚠️ Never commit secrets to git
- R2 bucket is private by default
- Images are served through Worker (no direct R2 access)

## File Structure
```
my_love/
├── worker/
│   ├── index.js      # Worker script
│   ├── wrangler.toml # Config (no secrets)
│   └── package.json
├── storage.js        # R2 integration
├── main.js
├── main.css
├── index.html
└── .gitignore        # Ignores secrets
```
