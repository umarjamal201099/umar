# Booking & Payment Setup — V11

Last reviewed: 1 September 2026.

The portfolio works immediately with the Formspree booking-request fallback. Live scheduling/payment is optional and is controlled from:

`assets/js/booking-config.js`

Only paste **public booking/event URLs** there. Never put Stripe secret keys, webhook secrets, API keys, passwords or other private credentials in frontend JavaScript.

## Recommended: Cal.com Free

For a one-person consulting portfolio, Cal.com Free is the cleanest all-in-one starting point. Its current Individuals Free plan is listed as free forever and includes unlimited event types/calendars plus Stripe and PayPal payment support.

Create four public events:

1. Free 15-minute fit check — $0
2. 30-minute Technical Direction — $35
3. 60-minute Architecture / ERP Advisory — $65
4. 90-minute Deep-Dive Review — $95

Connect Google/Outlook calendar availability, then connect Stripe or PayPal only for the paid event types. Paste each public event URL into `booking-config.js`.

```js
window.PORTFOLIO_BOOKING = {
  providerLabel: 'Cal.com',
  sessions: {
    'Free 15-minute fit check': {
      url: 'https://cal.com/YOUR-NAME/discovery'
    },
    '30-minute Technical Direction — $35': {
      url: 'https://cal.com/YOUR-NAME/technical-direction'
    },
    '60-minute Architecture / ERP Advisory — $65': {
      url: 'https://cal.com/YOUR-NAME/erp-advisory'
    },
    '90-minute Deep-Dive Review — $95': {
      url: 'https://cal.com/YOUR-NAME/deep-dive'
    }
  }
};
```

When a configured session is selected, the portfolio reveals an **Open live calendar** action. If the URL is blank, the manual request form remains available.

A free scheduler plan does not mean card processing is free. Stripe/PayPal still apply their normal processing charges.

## Google Calendar option

A personal Google Account can create a single appointment-schedule booking page. This is a good zero-subscription option for the free 15-minute discovery call. Paste the public Google booking-page URL into the free session in `booking-config.js`.

Google's paid-appointment features require an eligible premium subscription, so Google is not the best zero-subscription route for all paid advisory sessions.

## TidyCal option

TidyCal currently offers:

- Free — $0 forever
- Individual Lifetime — $29 one time
- Agency Lifetime — $79 one time
- Pro — recurring subscription

Paid bookings are available on the Free and Lifetime plans. Current TidyCal documentation says Stripe OAuth payments on Free/Lifetime plans carry a 1% TidyCal platform fee in addition to the payment processor fee; Pro removes that platform fee. PayPal uses its normal processing fees and TidyCal documents no additional TidyCal platform fee for those PayPal bookings.

TidyCal is useful if you specifically want a one-time lifetime scheduler purchase.

## Stripe Payment Links

Stripe Payment Links are included with standard Stripe Payments pricing without a separate Payment Links subscription charge. Standard payment-processing fees still apply.

For this portfolio, booking and payment in one scheduler is usually a smoother experience than sending clients through separate schedule and payment pages.

## Recommended setup order

1. Start with Cal.com Free for all four sessions.
2. Connect your Google/Outlook calendar.
3. Add Google Meet / Teams / Zoom to the events.
4. Connect Stripe or PayPal for paid sessions only.
5. Paste the four public event URLs into `booking-config.js`.
6. Keep the Formspree request form as a fallback.

Official references to re-check before launch:

- Cal.com pricing: https://cal.com/pricing
- Google Calendar appointment schedules: https://support.google.com/calendar/answer/10729749
- TidyCal pricing: https://tidycal.com/pricing
- Stripe pricing / Payment Links: https://stripe.com/pricing
