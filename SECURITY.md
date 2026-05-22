# Security for this site

This is a static portfolio site. We’ve added in-page protections (CSP + Referrer Policy) and provide server-side header configurations you can enable on your host/CDN for stronger security.

## What’s already enabled (in HTML)
- Content-Security-Policy via `<meta http-equiv>` to restrict scripts, styles, images, frames, and base URI.
- Referrer Policy set to `strict-origin-when-cross-origin`.
- A `.well-known/security.txt` file for coordinated disclosure.

Current CSP (mirrors what’s in `index.html`):
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self'; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com data:; 
  img-src 'self' data:; 
  object-src 'none'; 
  base-uri 'self'; 
  form-action 'self'; 
  frame-ancestors 'none'; 
  upgrade-insecure-requests; 
  connect-src 'self'
```

Notes:
- `fonts.googleapis.com` and `fonts.gstatic.com` are allowed because the CSS imports Google Fonts.
- If you remove Google Fonts usage, you can drop those hosts from the policy.
- If you later add inline scripts (not recommended), you’ll need to add a nonce or `'unsafe-inline'` for `script-src` (prefer nonces).

## Recommended server/CDN headers
Add these at your hosting layer when possible (HTTP response headers are stronger than `<meta>`):

- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- Content-Security-Policy: (same as above; set as an HTTP header if your host supports it)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(), magnetometer=(), gyroscope=(), accelerometer=()
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: same-origin

### Netlify (_headers)
Create a file named `_headers` at your publish root:
```
/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; connect-src 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(), magnetometer=(), gyroscope=(), accelerometer=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
```

### Vercel (vercel.json)
Create `vercel.json` at your project root:
```
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; connect-src 'self'" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(), magnetometer=(), gyroscope=(), accelerometer=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

### Nginx
Add inside your `server { ... }` block:
```
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; connect-src 'self'" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(), magnetometer=(), gyroscope=(), accelerometer=()" always;
add_header Cross-Origin-Opener-Policy same-origin always;
add_header Cross-Origin-Resource-Policy same-origin always;
```

### Apache (.htaccess)
```
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; connect-src 'self'"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(), magnetometer=(), gyroscope=(), accelerometer=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Cross-Origin-Resource-Policy "same-origin"
</IfModule>
```

### GitHub Pages
GitHub Pages does not currently support custom response headers. Options:
- Put the site behind a CDN like Cloudflare and set headers at the CDN.
- Host on Netlify or Vercel for first-class header support.

## security.txt
File at `/.well-known/security.txt` announces how to report vulnerabilities.
Update the Contact/Policy URLs if these change.

```
Contact: https://github.com/MariosGeorgiades
Preferred-Languages: en
Policy: https://github.com/MariosGeorgiades/website/blob/main/SECURITY.md
Expires: 2026-10-25T00:00:00.000Z
```

## Maintenance tips
- When adding third-party scripts or styles, update the CSP accordingly.
- Prefer hosting your own assets or using subresource integrity (SRI) for external resources.
- Keep libraries updated and remove unused scripts/styles.
