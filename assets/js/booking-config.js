/*
  Optional live scheduling/payment configuration — V16.

  Keep URLs empty and the existing Formspree booking request remains the fallback.
  Recommended no-monthly-cost route for an individual portfolio:
    - Cal.com Free: free + paid event types, calendar sync, Stripe/PayPal support.
    - Google Calendar: excellent for the free discovery call; personal accounts can
      create one booking page, but Google's built-in paid appointments require an
      eligible paid plan.
    - TidyCal: free plan plus optional one-time lifetime plans; check current
      platform/payment fees before choosing it.

  Paste only public booking/event URLs here. Never place Stripe secret keys,
  API keys, webhook secrets or other credentials in frontend JavaScript.
*/
window.PORTFOLIO_BOOKING = {
  providerLabel: '', // e.g. 'Cal.com' or 'Google Calendar'
  sessions: {
    'Free 15-minute fit check': {
      url: '', // e.g. https://cal.com/your-name/discovery OR your Google booking page
      note: 'Choose a live time slot for the free discovery call.'
    },
    '30-minute Technical Direction — $35': {
      url: '', // e.g. Cal.com paid event link
      note: 'Choose a live time slot and complete payment with the connected provider.'
    },
    '60-minute Architecture / ERP Advisory — $65': {
      url: '',
      note: 'Choose a live time slot and complete payment with the connected provider.'
    },
    '90-minute Deep-Dive Review — $95': {
      url: '',
      note: 'Choose a live time slot and complete payment with the connected provider.'
    }
  }
};
