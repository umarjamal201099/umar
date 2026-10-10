(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNavMedia = window.matchMedia('(max-width: 1080px)');
  const pageMain = document.querySelector('main');
  const pageFooter = document.querySelector('footer');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });


  /* Scroll progress + smart anchor motion.
     Nearby jumps can animate; long jumps are immediate so the UI never feels slow. */
  const scrollProgress = document.querySelector('[data-scroll-progress]');
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    if (!scrollProgress) return;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
    scrollProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
  };
  const requestProgress = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateProgress);
  };
  updateProgress();
  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress, { passive: true });

  const navigateToHash = (raw, { updateHistory = true, forceAuto = false } = {}) => {
    if (!raw || raw === '#') return false;
    let target = null;
    try { target = document.querySelector(raw); } catch { return false; }
    if (!target) return false;

    const headerOffset = Math.max(header?.offsetHeight || 64, 64) + 20;
    const targetY = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);
    const distance = Math.abs(targetY - window.scrollY);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canAnimate = !forceAuto && !reduced && distance <= window.innerHeight * 1.15;
    window.scrollTo({ top: targetY, behavior: canAnimate ? 'smooth' : 'auto' });

    if (updateHistory) {
      try { history.pushState(null, '', raw); } catch { /* Ignore history failures on local/file contexts. */ }
    }
    if (target.id === 'main') {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    return true;
  };

  const syncHashPosition = () => {
    if (!location.hash) return;
    window.requestAnimationFrame(() => navigateToHash(location.hash, { updateHistory: false }));
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const raw = link.getAttribute('href');
    if (!raw || raw === '#') return;

    let target = null;
    try { target = document.querySelector(raw); } catch { return; }
    if (!target) return;

    event.preventDefault();
    const fromMenu = Boolean(link.closest('[data-nav]'));
    if (fromMenu && mobileNavMedia.matches) {
      setMenu(false);
      window.requestAnimationFrame(() => navigateToHash(raw, { forceAuto: true }));
    } else {
      navigateToHash(raw, { forceAuto: fromMenu });
    }
  });

  const syncNavAccessibility = () => {
    if (!nav) return;
    const isMobile = mobileNavMedia.matches;
    const isOpen = nav.classList.contains('is-open');

    if (isMobile && !isOpen) {
      nav.setAttribute('aria-hidden', 'true');
      nav.inert = true;
    } else {
      nav.removeAttribute('aria-hidden');
      nav.inert = false;
    }
  };

  const setMenu = (open, { restoreFocus = false } = {}) => {
    if (!nav || !navToggle) return;
    const shouldOpen = mobileNavMedia.matches && Boolean(open);
    const wasOpen = nav.classList.contains('is-open');
    nav.classList.toggle('is-open', shouldOpen);
    navToggle.setAttribute('aria-expanded', String(shouldOpen));
    const label = navToggle.querySelector('span');
    if (label) label.textContent = shouldOpen ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', shouldOpen);
    if (pageMain) pageMain.inert = shouldOpen;
    if (pageFooter) pageFooter.inert = shouldOpen;
    syncNavAccessibility();

    if (wasOpen && !shouldOpen && restoreFocus) {
      window.setTimeout(() => navToggle.focus(), 0);
    }
  };

  navToggle?.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelector('.nav-book')?.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      event.preventDefault();
      setMenu(false, { restoreFocus: true });
    }
  });

  const handleNavBreakpoint = () => setMenu(false);
  if (mobileNavMedia.addEventListener) mobileNavMedia.addEventListener('change', handleNavBreakpoint);
  else mobileNavMedia.addListener?.(handleNavBreakpoint);
  syncNavAccessibility();

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  /* Interactive enterprise architecture */
  const architectureNodes = [...document.querySelectorAll('[data-arch-key]')];
  const architectureTitle = document.querySelector('[data-arch-title]');
  const architectureCopy = document.querySelector('[data-arch-copy]');
  const architectureIndex = document.querySelector('[data-arch-index]');
  const architecturePitch = document.querySelector('[data-arch-pitch]');
  const architectureFocus = document.querySelector('[data-arch-focus]');
  const architectureMethod = document.querySelector('[data-arch-method]');
  const architectureOutcome = document.querySelector('[data-arch-outcome]');
  const architectureScreen = document.querySelector('.system-screen');

  const pitchByKey = {
    customer: 'Start with the business demand and keep the path into ERP explicit.',
    crm: 'Let CRM own customer context while ERP owns operational transactions.',
    erp: 'Keep ERP responsible for operations, then connect everything else through controlled services and APIs.',
    integration: 'Put integration logic in maintainable .NET services instead of burying it inside point-to-point connections.',
    api: 'Use clear API contracts so systems can evolve without breaking each other.',
    identity: 'Centralize access rules so users, roles and tenant boundaries stay consistent across applications.',
    external: 'Connect Xero, CRM and other external tools without making them depend on Epicor internals.',
    data: 'Treat data as a governed foundation for transactions, reporting and integrations—not an uncontrolled shared database.'
  };

  const factsByKey = {
    customer: { focus: 'Business demand', method: 'Controlled intake', outcome: 'Traceable handoff' },
    crm: { focus: 'Customer context', method: 'Clear data ownership', outcome: 'Consistent sales-to-ERP flow' },
    erp: { focus: 'Operational continuity', method: 'ERP-owned rules', outcome: 'Stable system of record' },
    integration: { focus: 'Maintainability', method: 'Typed .NET services', outcome: 'Looser system coupling' },
    api: { focus: 'System contracts', method: 'Versioned REST APIs', outcome: 'Safer independent change' },
    identity: { focus: 'Access governance', method: 'OIDC / OAuth + RBAC', outcome: 'Consistent security boundaries' },
    external: { focus: 'External connectivity', method: 'Explicit adapters', outcome: 'Replaceable integrations' },
    data: { focus: 'Recovery & reporting', method: 'SQL + backup / restore', outcome: 'Operational resilience' }
  };

  const selectArchitectureNode = (node) => {
    if (!node) return;
    architectureNodes.forEach((item) => {
      const active = item === node;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (architectureTitle) architectureTitle.textContent = node.dataset.title || '';
    if (architectureCopy) architectureCopy.textContent = node.dataset.copy || '';
    const facts = factsByKey[node.dataset.archKey] || {};
    if (architecturePitch) architecturePitch.textContent = pitchByKey[node.dataset.archKey] || '';
    if (architectureFocus) architectureFocus.textContent = facts.focus || '—';
    if (architectureMethod) architectureMethod.textContent = facts.method || '—';
    if (architectureOutcome) architectureOutcome.textContent = facts.outcome || '—';
    if (architectureIndex) {
      const raw = node.querySelector('span')?.textContent || '';
      architectureIndex.textContent = raw.match(/\d{2}/)?.[0] || '—';
    }
  };

  architectureNodes.forEach((node) => {
    node.setAttribute('aria-pressed', String(node.classList.contains('is-active')));
    node.addEventListener('focus', () => selectArchitectureNode(node));
    node.addEventListener('click', () => selectArchitectureNode(node));
  });

  const architectureNetwork = document.querySelector('[data-architecture-network]');
  const architectureModeButtons = [...document.querySelectorAll('[data-architecture-mode]')];
  const modeDefaultNode = {
    executive: 'erp',
    technical: 'integration',
    security: 'identity'
  };

  architectureModeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
    button.addEventListener('click', () => {
      const mode = button.dataset.architectureMode || 'executive';
      if (architectureNetwork) architectureNetwork.dataset.mode = mode;
      if (architectureScreen) architectureScreen.dataset.mode = mode;
      architectureModeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const preferred = architectureNodes.find((node) => node.dataset.archKey === modeDefaultNode[mode]);
      selectArchitectureNode(preferred);
    });
  });


  if (architectureNetwork && architectureScreen) {
    architectureScreen.dataset.mode = architectureNetwork.dataset.mode || 'executive';
  }
  selectArchitectureNode(architectureNodes.find((node) => node.classList.contains('is-active')) || architectureNodes[0]);

  /* Subtle screen depth — deliberately restrained and disabled on touch/reduced-motion. */
  const tiltScreen = document.querySelector('[data-tilt-screen]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (tiltScreen && !reducedMotion.matches && window.matchMedia('(pointer:fine)').matches) {
    tiltScreen.addEventListener('pointermove', (event) => {
      const rect = tiltScreen.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tiltScreen.style.transform = `perspective(1600px) rotateX(${(-y * 0.35).toFixed(2)}deg) rotateY(${(x * 0.35).toFixed(2)}deg)`;
    });
    tiltScreen.addEventListener('pointerleave', () => {
      tiltScreen.style.transform = '';
    });
  }


  /* Interactive Centaiva product window.
     This stays fully internal to the page: sidebar tabs and cards update the
     architecture preview without navigating away. */
  const productDemo = document.querySelector('[data-product-demo]');
  if (productDemo) {
    const productMain = productDemo.querySelector('.product-main');
    const productTabs = [...productDemo.querySelectorAll('[data-product-tab]')];
    const productKicker = productDemo.querySelector('[data-product-kicker]');
    const productTitle = productDemo.querySelector('[data-product-title]');
    const productStatus = productDemo.querySelector('[data-product-status]');
    const productSummary = productDemo.querySelector('[data-product-summary]');
    const productKpis = [...productDemo.querySelectorAll('[data-product-kpi]')];
    const productFlow = productDemo.querySelector('[data-product-flow]');
    const productLower = [...productDemo.querySelectorAll('[data-product-lower]')];
    const productSelection = productDemo.querySelector('[data-product-selection]');
    let productRenderTimer = 0;

    const productLayers = {
      platform: {
        kicker: 'Architecture / overview',
        title: 'Platform control plane',
        status: 'Live system model',
        summary: 'One control plane keeps identity, tenancy, access, products, integrations and data boundaries understandable.',
        kpis: [['Identity', 'OIDC / OAuth 2.0'], ['Tenancy', 'Scoped hierarchy'], ['Access', 'Roles + permissions']],
        flow: [['Platform', 'Control'], ['Identity', 'SSO'], ['Tenant', 'Context'], ['Apps', 'Access']],
        lower: [['Commercial layer', 'Products · plans · subscriptions · entitlements'], ['Integration layer', 'OAuth clients · API keys · webhooks · external services'], ['Data & deployment', 'Shared/dedicated data · routing · audit · backups']]
      },
      identity: {
        kicker: 'Identity / SSO',
        title: 'Central identity boundary',
        status: 'Authentication flow',
        summary: 'Applications redirect authentication to one standards-based identity layer, then consume scoped tokens and claims.',
        kpis: [['Protocol', 'OIDC / OAuth 2.0'], ['Session', 'PKCE · JWT'], ['Assurance', 'MFA / passkeys']],
        flow: [['App', 'Request'], ['Identity', 'Authenticate'], ['Token', 'Claims'], ['App', 'Access']],
        lower: [['Providers', 'Microsoft Entra · Okta · generic OIDC'], ['Access controls', 'RBAC · delegated access · least privilege'], ['Audit', 'Authentication events · access trails · support visibility']]
      },
      tenancy: {
        kicker: 'Tenancy / hierarchy',
        title: 'Scoped tenant hierarchy',
        status: 'Context model',
        summary: 'Partner, customer and tenant boundaries are explicit so administration and data access remain scoped as the platform grows.',
        kpis: [['Partner / org', 'Delegated scope'], ['Tenant admin', 'Controlled admin'], ['Users', 'Scoped membership']],
        flow: [['Platform', 'Owner'], ['Partner', 'Scope'], ['Tenant', 'Context'], ['Users', 'Membership']],
        lower: [['Isolation', 'Tenant-aware authorization and data context'], ['Delegation', 'Partner and tenant administration boundaries'], ['Scale', 'Reusable hierarchy for direct and partner customers']]
      },
      entitlements: {
        kicker: 'Commercial / access',
        title: 'Products and entitlements',
        status: 'Commercial model',
        summary: 'Commercial rules are separated from application code so plans, subscriptions, limits and feature access can evolve safely.',
        kpis: [['Products', 'Reusable catalog'], ['Plans', 'Policy bundles'], ['Subscriptions', 'Lifecycle state']],
        flow: [['Product', 'Catalog'], ['Plan', 'Rules'], ['Subscription', 'State'], ['Entitlement', 'Access']],
        lower: [['Usage limits', 'API and feature consumption boundaries'], ['Seat limits', 'Licensed user capacity and assignments'], ['Billing link', 'Commercial state mapped to platform access']]
      },
      integrations: {
        kicker: 'API / integrations',
        title: 'Controlled integration layer',
        status: 'Service boundary',
        summary: 'External systems integrate through explicit clients, keys, webhooks and scoped services rather than depending on internal tables.',
        kpis: [['OAuth clients', 'Scoped credentials'], ['API keys', 'Service access'], ['Webhooks', 'Event delivery']],
        flow: [['External', 'Request'], ['Gateway', 'Validate'], ['Service', 'Scope'], ['System', 'Execute']],
        lower: [['Finance', 'Xero Accounting API integration boundary'], ['Automation', 'n8n / event-driven workflow connections'], ['Governance', 'Rate limits · audit · replaceable adapters']]
      },
      applications: {
        kicker: 'Applications',
        title: 'Shared platform applications',
        status: 'Application access',
        summary: 'Applications share identity, tenant context and entitlements while keeping their own domain workflows and data responsibilities clear.',
        kpis: [['CRM', 'MedPure'], ['Timesheets', 'Workwell'], ['Finance', 'Workwell']],
        flow: [['SSO', 'User'], ['Tenant', 'Context'], ['App', 'Permission'], ['Feature', 'Access']],
        lower: [['Shared identity', 'One sign-on and consistent token model'], ['Per-app permissions', 'Roles and entitlements evaluated at launch'], ['Product surface', 'Independent applications on one platform foundation']]
      },
      data: {
        kicker: 'Data / deployment',
        title: 'Data and deployment strategy',
        status: 'Operational model',
        summary: 'Data placement, routing, audit and backup strategy are explicit platform concerns, not afterthoughts hidden inside application code.',
        kpis: [['Shared DB', 'Efficient tenancy'], ['Dedicated DB', 'Isolation option'], ['Regional routing', 'Deployment control']],
        flow: [['App', 'Context'], ['Data policy', 'Route'], ['Database', 'Store'], ['Audit', 'Recover']],
        lower: [['Isolation', 'Shared or dedicated deployment paths'], ['Observability', 'Audit logs · monitoring · regional routing'], ['Recovery', 'Backup policy · restore readiness · operational ownership']]
      }
    };

    const clearProductCardSelection = () => {
      [...productKpis, ...productLower].forEach((card) => {
        card.classList.remove('is-selected');
        card.setAttribute('aria-pressed', 'false');
      });
    };

    const updateProductContextFromCard = (card) => {
      if (!card) return;
      clearProductCardSelection();
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');
      const label = card.querySelector('span')?.textContent?.trim() || 'Selected detail';
      const value = card.querySelector('strong, p')?.textContent?.trim() || '';
      if (productSelection) productSelection.textContent = `${label} — ${value}`;
    };

    const renderProductLayer = (key, { focusTab = false } = {}) => {
      const data = productLayers[key] || productLayers.platform;
      const activeTab = productTabs.find((tab) => tab.dataset.productTab === key) || productTabs[0];
      productTabs.forEach((tab) => {
        const active = tab === activeTab;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      clearProductCardSelection();
      if (productSelection) productSelection.textContent = 'Choose any architecture card to inspect it without leaving the page.';
      if (productMain && activeTab?.id) productMain.setAttribute('aria-labelledby', activeTab.id);
      productMain?.classList.add('is-updating');
      if (productRenderTimer) window.clearTimeout(productRenderTimer);

      productRenderTimer = window.setTimeout(() => {
        if (productKicker) productKicker.textContent = data.kicker;
        if (productTitle) productTitle.textContent = data.title;
        if (productStatus) productStatus.textContent = data.status;
        if (productSummary) productSummary.textContent = data.summary;

        productKpis.forEach((card, index) => {
          const item = data.kpis[index];
          if (!item) return;
          const label = card.querySelector('span');
          const value = card.querySelector('strong');
          if (label) label.textContent = item[0];
          if (value) value.textContent = item[1];
        });

        if (productFlow) {
          productFlow.innerHTML = data.flow.map((item, index) => {
            const step = `<div><span>${item[0]}</span><strong>${item[1]}</strong></div>`;
            return index < data.flow.length - 1 ? `${step}<i aria-hidden="true">→</i>` : step;
          }).join('');
        }

        productLower.forEach((card, index) => {
          const item = data.lower[index];
          if (!item) return;
          const label = card.querySelector('span');
          const value = card.querySelector('p');
          if (label) label.textContent = item[0];
          if (value) value.textContent = item[1];
        });

        productMain?.classList.remove('is-updating');
        productRenderTimer = 0;
        if (focusTab) activeTab?.focus({ preventScroll: true });
      }, reducedMotion.matches ? 0 : 70);
    };

    productTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => renderProductLayer(tab.dataset.productTab || 'platform'));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = productTabs.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % productTabs.length;
        else nextIndex = (index - 1 + productTabs.length) % productTabs.length;
        const next = productTabs[nextIndex];
        renderProductLayer(next.dataset.productTab || 'platform', { focusTab: true });
      });
    });

    productKpis.forEach((card) => card.addEventListener('click', () => updateProductContextFromCard(card)));
    productLower.forEach((card) => card.addEventListener('click', () => updateProductContextFromCard(card)));
    renderProductLayer('platform');
  }

  /* Booking dialog — all free/paid CTAs connect to one request flow. */
  const bookingDialog = document.getElementById('booking-dialog');
  const serviceSelect = document.getElementById('booking-service');
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');
  const liveBooking = bookingForm?.querySelector('[data-live-booking]');
  const liveBookingLink = bookingForm?.querySelector('[data-live-booking-link]');
  const liveBookingLabel = bookingForm?.querySelector('[data-live-booking-label]');
  const liveBookingNote = bookingForm?.querySelector('[data-live-booking-note]');
  const bookingConfig = window.PORTFOLIO_BOOKING || {};
  const dateInput = bookingForm?.querySelector('input[type="datetime-local"]');
  const timezoneInput = bookingForm?.querySelector('input[name="Timezone"]');
  let lastBookingTrigger = null;

  const setMinimumBookingTime = () => {
    if (!dateInput) return;
    const earliest = new Date(Date.now() + 30 * 60 * 1000);
    const localValue = new Date(earliest.getTime() - earliest.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
    dateInput.min = localValue;
  };

  const populateTimezone = () => {
    if (!timezoneInput || timezoneInput.value.trim()) return;
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) timezoneInput.value = zone;
    } catch {
      /* Keep the field user-editable if the browser cannot resolve a timezone. */
    }
  };

  const syncLiveBooking = (service = '') => {
    const entry = bookingConfig?.sessions?.[service];
    const url = typeof entry?.url === 'string' ? entry.url.trim() : '';
    const available = /^https?:\/\//i.test(url);

    if (liveBooking) liveBooking.hidden = !available;
    if (!available) {
      liveBookingLink?.removeAttribute('href');
      return;
    }

    if (liveBookingLink) liveBookingLink.href = url;
    if (liveBookingLabel) {
      const provider = bookingConfig.providerLabel ? ` with ${bookingConfig.providerLabel}` : '';
      liveBookingLabel.textContent = `Book this session instantly${provider}`;
    }
    if (liveBookingNote) {
      liveBookingNote.textContent = entry.note || 'Choose a live time slot with the connected scheduling provider.';
    }
  };

  const openBooking = (service = '', trigger = null) => {
    lastBookingTrigger = trigger || document.activeElement;
    if (serviceSelect) {
      const hasRequestedService = [...serviceSelect.options].some((option) => option.value === service);
      serviceSelect.value = hasRequestedService ? service : '';
    }
    syncLiveBooking(serviceSelect?.value || service);
    if (bookingStatus) {
      bookingStatus.textContent = '';
      bookingStatus.className = 'form-status';
    }
    setMinimumBookingTime();
    populateTimezone();

    if (bookingDialog?.showModal) {
      if (!bookingDialog.open) bookingDialog.showModal();
      document.body.classList.add('dialog-open');
      window.setTimeout(() => {
        if (serviceSelect && !service) serviceSelect.focus();
        else bookingForm?.querySelector('input[name="Name"]')?.focus();
      }, 80);
    } else {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  const closeBooking = () => {
    if (bookingDialog?.open) bookingDialog.close();
  };

  document.querySelectorAll('[data-book-service]').forEach((button) => {
    button.addEventListener('click', () => openBooking(button.dataset.bookService || '', button));
  });

  serviceSelect?.addEventListener('change', () => syncLiveBooking(serviceSelect.value));

  document.querySelector('[data-close-booking]')?.addEventListener('click', closeBooking);
  bookingDialog?.addEventListener('click', (event) => {
    if (event.target === bookingDialog) closeBooking();
  });
  bookingDialog?.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (lastBookingTrigger instanceof HTMLElement && document.contains(lastBookingTrigger)) {
      window.setTimeout(() => lastBookingTrigger.focus(), 0);
    }
  });

  setMinimumBookingTime();
  populateTimezone();

  bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = bookingForm.querySelector('button[type="submit"]');
    const label = submit?.querySelector('span');
    const original = label?.textContent || 'Request this slot';

    if (submit) submit.disabled = true;
    if (label) label.textContent = 'Sending…';
    if (bookingStatus) {
      bookingStatus.textContent = '';
      bookingStatus.className = 'form-status';
    }

    try {
      const response = await fetch(bookingForm.action, {
        method: 'POST',
        body: new FormData(bookingForm),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Request failed');
      bookingForm.reset();
      syncLiveBooking('');
      populateTimezone();
      setMinimumBookingTime();
      if (bookingStatus) {
        bookingStatus.textContent = 'Request sent. I’ll reply with the confirmed slot and, for paid sessions, payment details.';
        bookingStatus.classList.add('success');
      }
    } catch {
      if (bookingStatus) {
        bookingStatus.textContent = 'Could not send right now. Please use WhatsApp or email instead.';
        bookingStatus.classList.add('error');
      }
    } finally {
      if (submit) submit.disabled = false;
      if (label) label.textContent = original;
    }
  });


  /* Purposeful motion: reveal content only when it becomes relevant.
     No-JS remains fully visible; reduced-motion users get an immediate layout. */
  const setupMotion = () => {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('motion-ready');

    const selectors = [
      '.hero-copy > *', '.hero-aside', '.current-grid > *', '.erp-heading > *',
      '.system-screen', '.architecture-brief', '.section-head > *', '.feature-case > *',
      '.work-row', '.role', '.capability-row', '.track-card', '.client-list > *',
      '.outcome-list > *', '.delivery-flow-heading > *', '.delivery-steps > *', '.delivery-flow-note',
      '.advisory-copy > *', '.advisory-free-card', '.engagement-flow > *', '.service-card',
      '.booking-cta-grid > *', '.contact-grid > *'
    ];

    const targets = [...document.querySelectorAll(selectors.join(','))];
    targets.forEach((node, index) => {
      node.classList.add('reveal-item');
      node.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 55, 165)}ms`);
    });

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));
  };

  setupMotion();

  const deliverySteps = document.querySelector('[data-flow-steps]');
  if (deliverySteps) {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      deliverySteps.classList.add('flow-visible');
    } else {
      const flowObserver = new IntersectionObserver((entries, io) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;
        deliverySteps.classList.add('flow-visible');
        io.disconnect();
      }, { threshold: 0.18 });
      flowObserver.observe(deliverySteps);
    }
  }

  /* Run decorative architecture pulses only while the system map is visible. */
  const architectureWorkbench = document.querySelector('.architecture-workbench');
  let architectureInView = false;
  const syncArchitectureActivity = () => {
    if (!architectureWorkbench) return;
    const shouldRun = architectureInView && !document.hidden && !reducedMotion.matches;
    architectureWorkbench.classList.toggle('system-active', shouldRun);
  };

  if (architectureWorkbench && 'IntersectionObserver' in window) {
    const architectureObserver = new IntersectionObserver((entries) => {
      architectureInView = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.06);
      syncArchitectureActivity();
    }, { threshold: [0, 0.06, 0.2] });
    architectureObserver.observe(architectureWorkbench);
  } else if (architectureWorkbench) {
    architectureInView = true;
    syncArchitectureActivity();
  }
  document.addEventListener('visibilitychange', syncArchitectureActivity);
  reducedMotion.addEventListener?.('change', syncArchitectureActivity);

  /* Deterministic active navigation. This avoids IntersectionObserver edge cases
     where a menu item could remain stuck on Work after a fast anchor jump. */
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const navSections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section)
    .sort((a, b) => a.section.offsetTop - b.section.offsetTop);
  let navFrame = 0;

  const updateActiveNav = () => {
    navFrame = 0;
    if (!navSections.length) return;
    const marker = Math.max(header?.offsetHeight || 64, 64) + Math.min(window.innerHeight * 0.18, 150);
    let current = null;
    for (const item of navSections) {
      if (item.section.getBoundingClientRect().top <= marker) current = item;
      else break;
    }
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (atPageEnd) current = navSections[navSections.length - 1];
    navLinks.forEach((link) => {
      const active = Boolean(current) && link === current.link;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const requestActiveNav = () => {
    if (navFrame) return;
    navFrame = window.requestAnimationFrame(updateActiveNav);
  };

  updateActiveNav();
  window.addEventListener('scroll', requestActiveNav, { passive: true });
  window.addEventListener('resize', requestActiveNav, { passive: true });
  window.addEventListener('hashchange', syncHashPosition);
})();
