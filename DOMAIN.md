# Digital Dakwah Platform - Domain Configuration

## 🌐 Custom Domain Setup

### Primary Domain
- **Production**: https://digital.zikirnurani.com
- **Platform**: Cloudflare Pages
- **SSL**: Auto-enabled with Cloudflare
- **CDN**: Global distribution via Cloudflare network

### Backup Domain
- **GitHub Pages**: https://kopiahhaji.github.io
- **Purpose**: Fallback and development testing
- **SSL**: Auto-enabled with GitHub Pages

## 🔧 Domain Configuration Details

### DNS Records (Cloudflare)
```
Type: CNAME
Name: digital
Target: kopiahhaji.github.io
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

### SSL/TLS Settings
- **SSL Mode**: Full (strict)
- **Edge Certificates**: Active
- **Always Use HTTPS**: Enabled
- **HSTS**: Enabled
- **Minimum TLS Version**: 1.2

### Page Rules
```
URL: digital.zikirnurani.com/*
Settings:
- Always Use HTTPS: On
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours
```

## 📊 Performance Optimizations

### Cloudflare Features Enabled
- [x] Auto Minify (HTML, CSS, JS)
- [x] Brotli Compression
- [x] HTTP/2 and HTTP/3
- [x] 0-RTT Connection Resumption
- [x] Enhanced HTTP/2 Prioritization

### Cache Configuration
- **Static Assets**: 30 days
- **HTML Files**: 4 hours
- **API Responses**: No cache
- **Images**: 7 days

## 🔍 SEO Configuration

### Meta Tags
```html
<meta name="description" content="Digital Dakwah Platform - Sabah's leading Islamic education and community platform">
<meta name="keywords" content="Islamic education, Sabah, Muslim community, digital dakwah">
<meta property="og:title" content="Digital Dakwah Platform - For the Sabah Ummah">
<meta property="og:description" content="Empowering Sabah's Muslim Community Through Digital Innovation">
<meta property="og:url" content="https://digital.zikirnurani.com">
<meta property="og:type" content="website">
```

### Structured Data
- Organization markup
- Website schema
- Local business schema (for marketplace)
- Educational organization schema

## 🚀 Deployment Workflow

### Automatic Deployment
1. **Git Push**: Code pushed to GitHub repository
2. **Webhook**: Cloudflare Pages receives notification
3. **Build**: Automatic deployment triggered
4. **Deploy**: Live site updated at digital.zikirnurani.com
5. **Cache**: Cloudflare cache automatically purged

### Build Settings
- **Build Command**: None (static site)
- **Output Directory**: / (root)
- **Node Version**: 18.x
- **Environment**: Production

## 📱 Mobile & PWA Features

### Progressive Web App
```json
{
  "name": "Digital Dakwah Platform",
  "short_name": "Dakwah",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#001f3f",
  "background_color": "#000711"
}
```

### Service Worker
- Offline capability for core pages
- Cache strategy for images and assets
- Background sync for community features

## 🔒 Security Headers

### Content Security Policy
```
default-src 'self' https:;
script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://generativelanguage.googleapis.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
```

### Additional Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

## 📊 Analytics & Monitoring

### Performance Monitoring
- **Core Web Vitals**: Tracked via Cloudflare Analytics
- **Real User Monitoring**: Enabled
- **Speed Insights**: Weekly reports
- **Uptime Monitoring**: 99.9% target

### Traffic Analytics
- **Page Views**: Daily/Monthly tracking
- **User Engagement**: Session duration and bounce rate
- **Geographic Distribution**: Sabah-focused metrics
- **Device Analytics**: Mobile vs Desktop usage

## 🎯 Custom Domain Benefits

### Branding
- Professional appearance: digital.zikirnurani.com
- Trust factor for users
- Better social media sharing
- Memorable URL for marketing

### SEO Advantages
- Domain authority building
- Better search rankings
- Local SEO for Sabah keywords
- Enhanced click-through rates

### Technical Benefits
- Full SSL control
- Advanced caching options
- Better performance analytics
- Custom email setup potential

---

**Domain Status**: ✅ Active and Optimized
**Last Updated**: July 2025
**Next Review**: August 2025
