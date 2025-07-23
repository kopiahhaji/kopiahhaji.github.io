# 🔐 API Security Fix & Deployment Guide

## ⚠️ CRITICAL: API Key Security Issue

**IMMEDIATE ACTION REQUIRED:** Your Google Gemini API key was publicly exposed in your GitHub repository. Follow these steps urgently:

## 🚨 Step 1: Revoke Compromised API Key (DO THIS FIRST!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Find the API key: `AIzaSyCpJ2hv2x4AJeofGNlISs-_9AEebuDF7OA`
4. **DELETE** or **DISABLE** it immediately
5. Create a new API key with proper restrictions

## 🛡️ Step 2: Deploy Secure API Proxy to Cloudflare Pages

Since you're using Cloudflare Pages connected to your GitHub repo, here's how to deploy the secure proxy:

### Cloudflare Pages Functions (Recommended for your setup)

1. **Create the function directory structure:**
   Create `functions/api/gemini-proxy.js` in your repo root:

   ```javascript
   export async function onRequestPost(context) {
       try {
           const { GEMINI_API_KEY } = context.env;
           
           if (!GEMINI_API_KEY) {
               return new Response(JSON.stringify({ 
                   success: false, 
                   error: 'API key not configured' 
               }), {
                   status: 500,
                   headers: { 'Content-Type': 'application/json' }
               });
           }

           const requestData = await context.request.json();
           const { prompt, temperature = 0.7, maxTokens = 1000 } = requestData;

           const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   contents: [{ parts: [{ text: prompt }] }],
                   generationConfig: { 
                       temperature, 
                       maxOutputTokens: maxTokens 
                   }
               })
           });

           const data = await response.json();
           
           return new Response(JSON.stringify({
               success: true,
               response: data.candidates[0]?.content?.parts[0]?.text || 'No response'
           }), {
               headers: { 
                   'Content-Type': 'application/json',
                   'Access-Control-Allow-Origin': '*',
                   'Access-Control-Allow-Methods': 'POST',
                   'Access-Control-Allow-Headers': 'Content-Type'
               }
           });

       } catch (error) {
           return new Response(JSON.stringify({ 
               success: false, 
               error: 'Failed to process request' 
           }), {
               status: 500,
               headers: { 'Content-Type': 'application/json' }
           });
       }
   }
   ```

2. **Set Environment Variable in Cloudflare:**
   - Go to Cloudflare Dashboard → Pages → Your Site
   - Go to **Settings** → **Environment Variables**
   - Add: `GEMINI_API_KEY` = `your_new_api_key`
   - Set for **Production** environment

3. **Push to GitHub:**
   Your changes will automatically deploy via Cloudflare Pages!

## 🔧 Step 3: Update Frontend Configuration

Update the proxy URL in your configuration:

```javascript
const GEMINI_CONFIG = {
    PROXY_URL: 'https://your-deployment-url.vercel.app/api/gemini-proxy',
    // or for Netlify: 'https://your-site.netlify.app/.netlify/functions/gemini-proxy'
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    RETRY_ATTEMPTS: 2,
    TIMEOUT: 10000
};
```

## 🔒 Step 4: Security Best Practices

### API Key Restrictions (Google Cloud Console):
1. **HTTP referrers:** Add your domain(s)
   - `https://kopiahhaji.github.io/*`
   - `https://your-deployment-url.vercel.app/*`

2. **API restrictions:** Limit to Generative Language API only

### Environment Variables:
- ✅ Store API keys in environment variables
- ✅ Never commit API keys to git
- ✅ Use server-side proxy for API calls
- ✅ Implement CORS restrictions

## 📝 Step 5: Update Repository

1. **Commit the security fixes:**
   ```bash
   git add .
   git commit -m "🔐 Security Fix: Remove exposed API key, implement secure proxy"
   git push origin main
   ```

2. **Monitor for any remaining exposed keys:**
   ```bash
   grep -r "AIza" . --exclude-dir=.git
   ```

## ⚡ Quick Security Check

After deployment, verify:
- [ ] Old API key is deleted/disabled
- [ ] New API key is only in environment variables
- [ ] Frontend uses proxy endpoint
- [ ] No API keys visible in browser dev tools
- [ ] GitHub repository has no exposed keys

## 🆘 If You Need Help

1. **Vercel Documentation:** https://vercel.com/docs/functions
2. **Netlify Functions:** https://docs.netlify.com/functions/overview/
3. **Google Cloud API Security:** https://cloud.google.com/docs/authentication/api-keys

**Remember:** The old API key was public for an unknown period. Monitor your Google Cloud billing for any unexpected usage.
