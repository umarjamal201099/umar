# Umar Jamal — Premium Enterprise Portfolio V11

Responsive static portfolio focused on Epicor ERP, C#/.NET, SQL Server, Xero/finance integrations, enterprise architecture, identity, API delivery and technical advisory.

## V11 improvements

- Removed long-distance smooth scrolling that could make anchor navigation feel slow or leave screenshots on an in-between state.
- Added smart anchor motion: short nearby jumps can animate; long jumps are immediate.
- Removed opacity-based content reveal. Content remains fully readable at every frame while retaining restrained motion.
- Added a thin fixed-header reading-progress indicator using only `transform`.
- Preserved the interactive Business / Technical / Security ERP architecture modes and data-flow pulses.
- Architecture pulses still pause when off-screen, on hidden tabs and for reduced-motion users.
- Added a no-JavaScript contact fallback.
- Added safe IIS `web.config` defaults for the static site: WebP MIME support and basic response security headers.
- Kept the booking integration provider-agnostic: Cal.com, Google Calendar, TidyCal or any public booking URL can be connected in one config file.
- Retains the hardened 320px–1920px responsive layout from the previous QA builds.

## Booking

See `BOOKING-SETUP.md`.

The site works without a scheduler account. The Formspree booking request, WhatsApp and email paths remain available. When public event URLs are added to `assets/js/booking-config.js`, a live-calendar action appears automatically for that session.

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## IIS deployment

The project includes `web.config`. Copy the folder to the IIS site root and ensure the Static Content feature is enabled. HTTPS redirection is intentionally not forced in the included config because TLS bindings differ by server; configure that at IIS/site level after the certificate is installed.

## Deployment targets

Plain HTML/CSS/JavaScript. Suitable for IIS, GitHub Pages, Netlify, Cloudflare Pages and similar static hosting.
