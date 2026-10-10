(() => {
  'use strict';

  /* -------------------------------------------------------
     External-link policy
     - Every remote HTTP(S) URL opens in a new tab.
     - rel=noopener,noreferrer is enforced.
     - A screen-reader-only hint communicates the behavior.
     ------------------------------------------------------- */
  const externalLinks = [...document.querySelectorAll('a[href]')].filter((link) => {
    const raw = link.getAttribute('href') || '';
    if (!/^https?:/i.test(raw)) return false;
    try {
      return new URL(raw, window.location.href).origin !== window.location.origin;
    } catch {
      return false;
    }
  });

  externalLinks.forEach((link) => {
    link.target = '_blank';
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
    link.classList.add('external-new-tab');

    if (!link.querySelector('[data-new-tab-hint]')) {
      const hint = document.createElement('span');
      hint.className = 'sr-only';
      hint.dataset.newTabHint = '';
      hint.textContent = ' (opens in a new tab)';
      link.append(hint);
    }
  });

  /* -------------------------------------------------------
     In-portfolio preview policy — V20

     IMPORTANT:
     Third-party sites can block iframe embedding with X-Frame-Options
     or CSP frame-ancestors. A static GitHub Pages site cannot override
     those response headers. Therefore curated eye previews default to
     a reliable same-origin portfolio overview instead of showing a
     browser error panel.

     Optional live iframe mode remains available only for destinations
     explicitly marked data-preview-mode="live" after they are verified
     to permit framing.
     ------------------------------------------------------- */
  const dialog = document.getElementById('site-preview-dialog');
  if (!dialog) return;

  const frame = dialog.querySelector('[data-site-preview-frame]');
  const loading = dialog.querySelector('[data-site-preview-loading]');
  const overview = dialog.querySelector('[data-site-preview-overview]');
  const title = dialog.querySelector('[data-site-preview-title]');
  const kicker = dialog.querySelector('[data-site-preview-kicker]');
  const description = dialog.querySelector('[data-site-preview-description]');
  const domain = dialog.querySelector('[data-site-preview-domain]');
  const cardDomain = dialog.querySelector('[data-site-preview-domain-card]');
  const cardOverline = dialog.querySelector('[data-site-preview-overline]');
  const cardTitle = dialog.querySelector('[data-site-preview-card-title]');
  const cardDescription = dialog.querySelector('[data-site-preview-card-description]');
  const context = dialog.querySelector('[data-site-preview-context]');
  const tags = dialog.querySelector('[data-site-preview-tags]');
  const openLink = dialog.querySelector('[data-site-preview-open]');
  const openLinkSecondary = dialog.querySelector('[data-site-preview-open-secondary]');
  const closeButton = dialog.querySelector('[data-site-preview-close]');
  const reloadButton = dialog.querySelector('[data-site-preview-reload]');
  const status = dialog.querySelector('.site-preview-status');
  const previewCandidates = [...document.querySelectorAll('[data-site-preview]')];

  const previewCandidatesValid = previewCandidates.filter((trigger) => {
    const raw = trigger.getAttribute('href') || trigger.dataset.previewUrl || '';
    const hasLabel = Boolean((trigger.dataset.previewTitle || '').trim());
    if (!raw || !hasLabel) {
      trigger.removeAttribute('data-site-preview');
      return false;
    }
    try {
      const parsed = new URL(raw, window.location.href);
      if (!/^https?:$/.test(parsed.protocol)) {
        trigger.removeAttribute('data-site-preview');
        return false;
      }
      return true;
    } catch {
      trigger.removeAttribute('data-site-preview');
      return false;
    }
  });

  const eyeMarkup = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.7 12s3.5-6 9.3-6 9.3 6 9.3 6-3.5 6-9.3 6-9.3-6-9.3-6Z"></path>
      <circle cx="12" cy="12" r="2.7"></circle>
    </svg>`;

  const decoratePreviewTrigger = (trigger) => {
    trigger.classList.add('site-preview-trigger');

    if (trigger.closest('.client-list')) {
      const tail = trigger.querySelector('.client-tail, i');
      if (tail) {
        tail.classList.add('site-preview-row-cue');
        tail.innerHTML = `${eyeMarkup}<span>Preview</span>`;
        return;
      }
    }

    if (!trigger.querySelector('.site-preview-eye-cue')) {
      const cue = document.createElement('span');
      cue.className = 'site-preview-eye-cue';
      cue.setAttribute('aria-hidden', 'true');
      cue.innerHTML = eyeMarkup;
      trigger.prepend(cue);
    }
  };

  previewCandidatesValid.forEach(decoratePreviewTrigger);

  let currentUrl = '';
  let currentMode = 'overview';
  let lastTrigger = null;
  let loadTimer = 0;

  const showDialog = () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('site-preview-open');
  };

  const text = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();

  const derivePreviewContext = (trigger) => {
    const result = { summary: '', detail: '', tags: [] };

    const workRow = trigger.closest('.work-row');
    if (workRow) {
      result.summary = text(workRow.querySelector('.work-description p'));
      result.detail = text(workRow.querySelector('.work-title p'));
      result.tags = text(workRow.querySelector('.work-description span')).split('·').map(v => v.trim()).filter(Boolean);
      return result;
    }

    const clientRow = trigger.closest('.client-list a');
    if (clientRow) {
      result.summary = text(clientRow.querySelector('strong'));
      result.detail = text(clientRow.querySelector('span'));
      result.tags = ['Project context', 'Public organisation site'];
      return result;
    }

    const trackCard = trigger.closest('.track-card, .engineering-track-card, .track-item');
    if (trackCard) {
      result.summary = text(trackCard.querySelector('p'));
      result.detail = text(trackCard.querySelector('h3'));
      result.tags = [...trackCard.querySelectorAll('.tag, li, code')].slice(0, 5).map(text).filter(Boolean);
      return result;
    }

    const resource = trigger.closest('.architecture-resources a');
    if (resource) {
      result.summary = text(resource.querySelector('small')) || trigger.dataset.previewDescription || '';
      result.detail = 'Technical reference';
      result.tags = ['Reference', 'External documentation'];
      return result;
    }

    result.summary = trigger.dataset.previewDescription || '';
    result.detail = trigger.dataset.previewKicker || 'External website';
    return result;
  };

  const renderTags = (items) => {
    if (!tags) return;
    tags.textContent = '';
    items.slice(0, 6).forEach((item) => {
      const span = document.createElement('span');
      span.textContent = item;
      tags.append(span);
    });
  };

  const renderOverview = (trigger, parsed) => {
    const info = derivePreviewContext(trigger);
    const name = trigger.dataset.previewTitle || text(trigger) || 'Website';
    const desc = info.summary || trigger.dataset.previewDescription || 'Public website connected to this portfolio work.';
    const detail = info.detail || trigger.dataset.previewKicker || 'External website';

    if (overview) overview.hidden = false;
    if (frame) {
      frame.hidden = true;
      frame.src = 'about:blank';
    }
    if (loading) loading.hidden = true;
    if (reloadButton) {
      reloadButton.hidden = true;
    }
    if (status) status.lastChild.textContent = ' Portfolio preview';

    if (cardOverline) cardOverline.textContent = (trigger.dataset.previewKicker || 'PUBLIC WEBSITE').toUpperCase();
    if (cardTitle) cardTitle.textContent = name;
    if (cardDescription) cardDescription.textContent = desc;
    if (context) {
      context.textContent = '';
      const label = document.createElement('span');
      label.textContent = 'Portfolio context';
      const strong = document.createElement('strong');
      strong.textContent = detail;
      context.append(label, strong);
    }
    renderTags(info.tags.length ? info.tags : ['Public website', 'Open live in new tab']);
    if (cardDomain) cardDomain.textContent = parsed.hostname.replace(/^www\./, '');
  };

  const showLiveFrame = (url) => {
    if (!frame) return;
    if (overview) overview.hidden = true;
    frame.hidden = false;
    if (loading) {
      loading.hidden = false;
      loading.classList.remove('is-complete');
    }
    if (reloadButton) {
      reloadButton.hidden = false;
      reloadButton.textContent = 'Reload';
      reloadButton.setAttribute('aria-label', 'Reload live preview');
    }
    if (status) status.lastChild.textContent = ' Live preview';

    frame.title = `${title?.textContent || 'Live website'} preview`;
    frame.src = 'about:blank';
    window.requestAnimationFrame(() => { frame.src = url; });
  };

  const hideLoadingSoon = () => {
    window.clearTimeout(loadTimer);
    loadTimer = window.setTimeout(() => loading?.classList.add('is-complete'), 180);
  };

  const openPreview = (trigger) => {
    const url = trigger.getAttribute('href') || trigger.dataset.previewUrl || '';
    if (!url) return;

    let parsed;
    try { parsed = new URL(url, window.location.href); }
    catch { return; }

    currentUrl = parsed.href;
    currentMode = trigger.dataset.previewMode === 'live' ? 'live' : 'overview';
    dialog.dataset.previewMode = currentMode;
    lastTrigger = trigger;

    const previewTitle = trigger.dataset.previewTitle || text(trigger) || 'Website';
    if (title) title.textContent = previewTitle;
    if (kicker) kicker.textContent = trigger.dataset.previewKicker || 'Website preview';
    if (description) description.textContent = currentMode === 'live'
      ? (trigger.dataset.previewDescription || 'Explore the public website without leaving the portfolio.')
      : 'Review the project context here, then open the live website for the full external experience.';
    if (domain) domain.textContent = parsed.hostname.replace(/^www\./, '');
    if (openLink) openLink.href = currentUrl;
    if (openLinkSecondary) openLinkSecondary.href = currentUrl;

    showDialog();
    if (currentMode === 'live') showLiveFrame(currentUrl);
    else renderOverview(trigger, parsed);
    window.setTimeout(() => closeButton?.focus({ preventScroll: true }), 0);
  };

  previewCandidatesValid.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openPreview(trigger);
    });
  });

  frame?.addEventListener('load', hideLoadingSoon);

  reloadButton?.addEventListener('click', () => {
    if (!currentUrl) return;
    if (currentMode === 'live') showLiveFrame(currentUrl);
    else if (lastTrigger) {
      const parsed = new URL(currentUrl);
      renderOverview(lastTrigger, parsed);
    }
  });

  const closePreview = () => {
    document.body.classList.remove('site-preview-open');
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  closeButton?.addEventListener('click', closePreview);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closePreview();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('site-preview-open');
    window.clearTimeout(loadTimer);
    loading?.classList.remove('is-complete');
    if (frame) {
      frame.src = 'about:blank';
      frame.hidden = true;
    }
    if (overview) overview.hidden = false;
    currentUrl = '';
    currentMode = 'overview';
    delete dialog.dataset.previewMode;
    const restore = lastTrigger;
    lastTrigger = null;
    window.setTimeout(() => restore?.focus({ preventScroll: true }), 0);
  });
})();
