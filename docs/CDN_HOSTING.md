# Kairo Engine - Direct CDN Hosting & Distribution System

You do **not** need NPM to distribute or host Kairo Engine! You can host or link Kairo Engine directly from global Content Delivery Networks (CDNs) or host your own CDN endpoint.

---

## 🚀 1. Free Global CDN Links (No NPM Required)

Because Kairo Engine is open-source on GitHub, the compiled module bundles in `dist/lib/` are automatically served globally on ultra-fast CDNs (jsDelivr, GitHub Pages, and unpkg):

### A. jsDelivr Global Edge CDN (300+ Edge Nodes Worldwide)
- **ESM Module (`.mjs`)**:
  ```html
  <script type="module">
    import { KairoApp } from 'https://cdn.jsdelivr.net/gh/Baba01hacker666/Kairo@main/dist/lib/kairo.mjs';
    const app = new KairoApp();
    app.start();
  </script>
  ```

- **UMD Browser Bundle (`.umd.js`)**:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/Baba01hacker666/Kairo@main/dist/lib/kairo.umd.js"></script>
  <script>
    const { KairoApp } = window.Kairo;
    const app = new KairoApp();
    app.start();
  </script>
  ```

---

### B. GitHub Pages CDN (Self-Hosted on Repository Push)
On every commit to `main`, GitHub Actions automatically builds `dist/lib/` and deploys it to your custom GitHub Pages domain:

- **UMD Bundle**: `https://Baba01hacker666.github.io/Kairo/dist/lib/kairo.umd.js`
- **ESM Bundle**: `https://Baba01hacker666.github.io/Kairo/dist/lib/kairo.mjs`

---

## 🛠️ 2. Build Your Own Self-Hosted CDN Endpoint

If you want to host Kairo Engine on your own server, Cloudflare R2, AWS S3, or VPS:

### Step 1: Build CDN Bundles
```bash
npm run build:package
```

This generates:
- `dist/lib/kairo.mjs` (ES Module)
- `dist/lib/kairo.umd.js` (Browser UMD Bundle)
- `dist/lib/kairo.cjs` (CommonJS)

### Step 2: Upload to Cloudflare R2 / AWS S3 / Nginx
Upload `dist/lib/` to your S3 bucket or web server.

#### Example Nginx CDN Config (`/etc/nginx/conf.d/cdn.conf`):
```nginx
server {
    listen 80;
    server_name cdn.mygameengine.com;

    location / {
        root /var/www/kairo-cdn;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Now any game developer can link your private CDN:
```html
<script src="https://cdn.mygameengine.com/kairo.umd.js"></script>
```

---

## 📦 3. GitHub Releases Download System

You can attach the compiled standalone `.zip` archive to GitHub Releases so developers can download Kairo Engine directly to their hard drive:

```bash
# Package distribution files into standalone release zip
zip -r kairo-engine-v1.0.0.zip dist/lib/ dist/types/ README.md LICENSE
```

1. Go to `https://github.com/Baba01hacker666/Kairo/releases/new`
2. Tag release `v1.0.0`
3. Drag & drop `kairo-engine-v1.0.0.zip`
4. Direct download URL: `https://github.com/Baba01hacker666/Kairo/releases/latest/download/kairo-engine-v1.0.0.zip`
