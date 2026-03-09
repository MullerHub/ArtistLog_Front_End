---
description: Deployment and production configuration
applyTo: 'vercel.json,next.config.mjs,.env*,DEPLOYMENT.md,VERCEL_DEPLOY.md'
---

# Deployment Guidelines

## Production Environment

### Platform: Vercel (Recommended)
- Framework: Next.js 16 (auto-detected)
- Build Command: `npm run build` (automatic)
- Output Directory: `.next` (automatic)
- Node Version: 18+ (specified in package.json)

### Required Environment Variables

**Production (OBRIGATÓRIO):**
```bash
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
```

**Optional (have defaults):**
```bash
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org
NEXT_PUBLIC_BIGDATACLOUD_URL=https://api.bigdatacloud.net/data/reverse-geocode-client
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Configuration Files

**vercel.json:**
- Security headers configured (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Framework detection enabled
- No custom build commands needed

**next.config.mjs:**
- `typescript.ignoreBuildErrors: true` - permite deploy com avisos TypeScript
- `images.unoptimized: true` - otimização de imagens desabilitada para Vercel automático
- Logging reduzido para performance
- Turbopack habilitado

**.env files:**
- `.env.local` - desenvolvimento local (não commitado)
- `.env.production.example` - template para Vercel (commitado)
- `.env` - nunca commitar

## Deploy Process

### Quick Deploy (3 Steps)

1. **Connect Repository**
   - Go to: https://vercel.com/new
   - Import: `MullerHub/ArtistLog_Front_End`

2. **Configure Variables**
   - Add `NEXT_PUBLIC_API_URL` in Environment Variables
   - Apply to: Production, Preview, Development

3. **Deploy**
   - Click "Deploy"
   - Wait ~2-3 minutes

### CLI Deploy

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Automatic Deploys

- **Production**: Push to `main` branch
- **Preview**: Every PR creates preview deployment
- **Branch Deploys**: All branches get preview URLs

## Pre-Deploy Validation

Run validation script:
```bash
./pre-deploy-check.sh
```

Checks:
- ✅ Build succeeds (`npm run build`)
- ✅ Required files exist (vercel.json, next.config.mjs)
- ✅ Git status clean or documented changes
- ✅ Node/npm versions compatible

## Post-Deploy Validation

### Critical Flows to Test

1. **Authentication**
   - Signup (artist and venue)
   - Login with valid credentials
   - Logout
   - Protected route redirect

2. **Discovery**
   - Artist search
   - Venue search
   - Filters work
   - Profile details load

3. **Profile Management**
   - Photo upload
   - Edit profile data
   - Location save (base + exact)

4. **Notifications**
   - Center opens
   - Unread count
   - Mark as read

### Performance Targets

- Lighthouse Performance: > 80
- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Core Web Vitals: Green in Vercel Analytics

## Common Issues

### Build Failures

**TypeScript errors:**
- Already configured: `ignoreBuildErrors: true`
- If critical: fix in dev, test with `npm run build`

**Module not found:**
- Run `npm ci` locally
- Commit `package-lock.json`
- Verify all imports use correct paths

### Runtime Issues

**API not responding (CORS):**
```javascript
// Backend CORS config must include Vercel domain
cors({
  origin: ['https://seu-frontend.vercel.app', 'https://artistlog.com']
})
```

**404 on API calls:**
- Verify `NEXT_PUBLIC_API_URL` has no trailing `/`
- Test backend directly: `curl https://backend.vercel.app/health`

**Environment variables not working:**
- Must start with `NEXT_PUBLIC_` for client-side
- Rebuild after changing variables in Vercel dashboard
- Check "Redeploy" if variables change

### Performance Issues

**Slow page loads:**
- Check Vercel Analytics → Performance tab
- Review Network tab in DevTools
- Consider edge caching for API routes (future)

**Large bundle size:**
- Already optimized: dynamic imports where possible
- Use `npm run build` locally to see bundle analysis
- Consider splitting large pages

## Custom Domain

1. **Vercel Dashboard:** Settings → Domains
2. **Add domain:** `artistlog.com` and `www.artistlog.com`
3. **Configure DNS:**
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. **SSL:** Automatic via Vercel

## Multiple Environments

### Preview (Staging)
- Every PR gets automatic preview URL
- Use backend staging: `NEXT_PUBLIC_API_URL=https://staging-backend.vercel.app`
- Test before merging to main

### Production
- `main` branch auto-deploys to production
- Use production backend: `NEXT_PUBLIC_API_URL=https://api.artistlog.com`
- Monitor errors in Vercel dashboard

### Development
- Local: `.env.local` with `http://localhost:8080`
- Team can pull env vars: `npx vercel env pull`

## Monitoring

### Built-in (Vercel)
- **Real-time logs:** Dashboard → Logs tab
- **Analytics:** Core Web Vitals automatically tracked
- **Errors:** View in Functions → Errors

### Optional Integrations
- **Sentry:** Error tracking and alerts
- **LogRocket:** Session replay
- **Google Analytics:** User behavior (add via NEXT_PUBLIC_ANALYTICS_ID)

## Rollback

If deployment fails or has issues:

1. **Via Dashboard:**
   - Deployments → Select previous working deployment
   - Click "⋯" → "Promote to Production"

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Instant Rollback:**
   - Vercel keeps all deployments
   - One-click rollback in dashboard
   - Previous deployment becomes active immediately

## Security

### Headers (already configured in vercel.json)
- `X-Frame-Options: DENY` - prevent clickjacking
- `X-Content-Type-Options: nosniff` - prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - referrer control

### Environment Variables
- Never commit `.env` or `.env.local`
- Use Vercel dashboard for secrets
- Rotate API keys if exposed

### Authentication
- JWT tokens stored in `localStorage`
- Auto-clear on 401 responses
- Token expiry handled by backend

## Documentation

- **Quick Start:** `VERCEL_DEPLOY.md` (3 steps)
- **Detailed Guide:** `DEPLOYMENT.md` (full reference)
- **Checklist:** `DEPLOY_CHECKLIST.md` (validation)
- **Validation Script:** `pre-deploy-check.sh`

## Support

- **Vercel Docs:** https://vercel.com/docs/frameworks/nextjs
- **Next.js Deploy:** https://nextjs.org/docs/deployment
- **Project Issues:** GitHub Issues on repository
