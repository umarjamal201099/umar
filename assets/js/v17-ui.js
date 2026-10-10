(() => {
  'use strict';

  /* =======================================================
     V17 mobile system explorer
     Keeps the same architecture data, but shows one focused
     layer at a time on small screens instead of a long stack.
     ======================================================= */
  const explorer = document.querySelector('[data-mobile-system-explorer]');
  const desktopNodes = [...document.querySelectorAll('[data-arch-key]')];
  const mobileTabs = explorer ? [...explorer.querySelectorAll('[data-mobile-arch-key]')] : [];
  const modeButtons = [...document.querySelectorAll('[data-architecture-mode]')];

  const mobileIndex = explorer?.querySelector('[data-mobile-arch-index]');
  const mobileCategory = explorer?.querySelector('[data-mobile-arch-category]');
  const mobileTitle = explorer?.querySelector('[data-mobile-arch-title]');
  const mobileCopy = explorer?.querySelector('[data-mobile-arch-copy]');
  const mobileFocus = explorer?.querySelector('[data-mobile-arch-focus]');
  const mobileMethod = explorer?.querySelector('[data-mobile-arch-method]');
  const mobileOutcome = explorer?.querySelector('[data-mobile-arch-outcome]');
  const mobileModeLabel = explorer?.querySelector('[data-mobile-mode-label]');
  const mobileModeTitle = explorer?.querySelector('[data-mobile-mode-title]');
  const mobileModeCopy = explorer?.querySelector('[data-mobile-mode-copy]');
  const nextButton = explorer?.querySelector('[data-mobile-arch-next]');

  const nodeMeta = {
    customer: {
      index: '01', category: 'Business input',
      focus: 'Business demand', method: 'Controlled intake', outcome: 'Traceable handoff'
    },
    crm: {
      index: '02', category: 'Customer context',
      focus: 'Sales context', method: 'Clear ownership', outcome: 'Consistent ERP handoff'
    },
    erp: {
      index: '03', category: 'Operational core',
      focus: 'Operational continuity', method: 'ERP-owned rules', outcome: 'Stable system of record'
    },
    integration: {
      index: '04', category: 'Integration layer',
      focus: 'Maintainability', method: 'Typed .NET services', outcome: 'Looser system coupling'
    },
    api: {
      index: '05', category: 'System boundary',
      focus: 'API contracts', method: 'Versioned REST APIs', outcome: 'Safer independent change'
    },
    identity: {
      index: '06', category: 'Security boundary',
      focus: 'Access governance', method: 'OIDC / OAuth + RBAC', outcome: 'Consistent permissions'
    },
    external: {
      index: '07', category: 'Connected applications',
      focus: 'External connectivity', method: 'Explicit adapters', outcome: 'Replaceable integrations'
    },
    data: {
      index: '08', category: 'Data foundation',
      focus: 'Recovery & reporting', method: 'SQL + backup / restore', outcome: 'Operational resilience'
    }
  };

  const modeMeta = {
    executive: {
      label: 'Business flow',
      title: 'From customer demand to ERP operations',
      copy: 'Tap a layer once to see what it owns and how business activity becomes a controlled ERP transaction.',
      keys: ['customer', 'crm', 'erp'],
      defaultKey: 'erp'
    },
    technical: {
      label: 'Technical flow',
      title: 'From Epicor through services, APIs and data',
      copy: 'Explore the integration boundary without reading the entire architecture at once.',
      keys: ['erp', 'integration', 'api', 'external', 'data'],
      defaultKey: 'integration'
    },
    security: {
      label: 'Security flow',
      title: 'Identity, API access and connected applications',
      copy: 'Focus on authentication, authorization and the boundaries that protect connected systems.',
      keys: ['identity', 'api', 'external', 'erp'],
      defaultKey: 'identity'
    }
  };

  let currentMode = document.querySelector('[data-architecture-mode].is-active')?.dataset.architectureMode || 'executive';
  let currentKey = modeMeta[currentMode]?.defaultKey || 'erp';

  const sourceNode = (key) => desktopNodes.find((node) => node.dataset.archKey === key);

  const renderMobileLayer = (key, { activateDesktop = true, bringIntoView = false } = {}) => {
    if (!explorer || !nodeMeta[key]) return;
    const source = sourceNode(key);
    if (!source) return;
    currentKey = key;

    if (activateDesktop && !source.classList.contains('is-active')) source.click();

    const meta = nodeMeta[key];
    if (mobileIndex) mobileIndex.textContent = meta.index;
    if (mobileCategory) mobileCategory.textContent = meta.category;
    if (mobileTitle) mobileTitle.textContent = source.dataset.title || source.querySelector('strong')?.textContent || key;
    if (mobileCopy) mobileCopy.textContent = source.dataset.copy || '';
    if (mobileFocus) mobileFocus.textContent = meta.focus;
    if (mobileMethod) mobileMethod.textContent = meta.method;
    if (mobileOutcome) mobileOutcome.textContent = meta.outcome;

    mobileTabs.forEach((tab) => {
      const active = tab.dataset.mobileArchKey === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    if (bringIntoView) {
      const activeTab = mobileTabs.find((tab) => tab.dataset.mobileArchKey === key);
      activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const renderMode = (mode, { activateDefault = true } = {}) => {
    if (!explorer) return;
    const meta = modeMeta[mode] || modeMeta.executive;
    currentMode = mode;
    explorer.dataset.mode = mode;
    if (mobileModeLabel) mobileModeLabel.textContent = meta.label;
    if (mobileModeTitle) mobileModeTitle.textContent = meta.title;
    if (mobileModeCopy) mobileModeCopy.textContent = meta.copy;

    mobileTabs.forEach((tab) => {
      const visible = meta.keys.includes(tab.dataset.mobileArchKey || '');
      tab.hidden = !visible;
    });

    const nextKey = activateDefault || !meta.keys.includes(currentKey) ? meta.defaultKey : currentKey;
    renderMobileLayer(nextKey, { activateDesktop: false, bringIntoView: false });
  };

  mobileTabs.forEach((tab) => {
    tab.addEventListener('click', () => renderMobileLayer(tab.dataset.mobileArchKey || 'erp', { bringIntoView: true }));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const visible = mobileTabs.filter((item) => !item.hidden);
      const index = Math.max(0, visible.indexOf(tab));
      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = visible.length - 1;
      else if (event.key === 'ArrowRight') nextIndex = (index + 1) % visible.length;
      else nextIndex = (index - 1 + visible.length) % visible.length;
      event.preventDefault();
      const next = visible[nextIndex];
      next?.focus();
      if (next) renderMobileLayer(next.dataset.mobileArchKey || 'erp', { bringIntoView: true });
    });
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.architectureMode || 'executive';
      // The original architecture handler runs first and selects the matching desktop node.
      // Render the compact mobile explorer from the same state immediately afterwards.
      renderMode(mode, { activateDefault: true });
      const preferred = modeMeta[mode]?.defaultKey || 'erp';
      renderMobileLayer(preferred, { activateDesktop: false, bringIntoView: false });
    });
  });

  nextButton?.addEventListener('click', () => {
    const keys = modeMeta[currentMode]?.keys || modeMeta.executive.keys;
    const index = Math.max(0, keys.indexOf(currentKey));
    const next = keys[(index + 1) % keys.length];
    renderMobileLayer(next, { bringIntoView: true });
  });

  // Keep the mobile card synchronized if a node is selected on tablet/desktop,
  // or by another script/keyboard interaction.
  desktopNodes.forEach((node) => {
    node.addEventListener('click', () => renderMobileLayer(node.dataset.archKey || 'erp', { activateDesktop: false }));
    node.addEventListener('focus', () => renderMobileLayer(node.dataset.archKey || 'erp', { activateDesktop: false }));
  });

  renderMode(currentMode, { activateDefault: true });
  renderMobileLayer(currentKey, { activateDesktop: false });

  /* =======================================================
     Booking quick-select
     ======================================================= */
  const bookingDialog = document.getElementById('booking-dialog');
  const serviceSelect = document.getElementById('booking-service');
  const bookingChoices = [...document.querySelectorAll('[data-booking-choice]')];

  const syncBookingChoices = (service = '') => {
    const normalized = service || 'Free 15-minute fit check';
    bookingChoices.forEach((choice) => {
      const active = choice.dataset.bookingChoice === normalized;
      choice.classList.toggle('is-active', active);
      choice.setAttribute('aria-pressed', String(active));
    });
  };

  const chooseService = (service) => {
    if (!serviceSelect) return;
    const exists = [...serviceSelect.options].some((option) => option.value === service);
    if (!exists) return;
    serviceSelect.value = service;
    serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    syncBookingChoices(service);
  };

  bookingChoices.forEach((choice) => {
    choice.setAttribute('aria-pressed', String(choice.classList.contains('is-active')));
    choice.addEventListener('click', () => chooseService(choice.dataset.bookingChoice || 'Free 15-minute fit check'));
  });

  serviceSelect?.addEventListener('change', () => syncBookingChoices(serviceSelect.value));

  document.querySelectorAll('[data-book-service]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const service = trigger.dataset.bookService || 'Free 15-minute fit check';
      window.setTimeout(() => syncBookingChoices(serviceSelect?.value || service), 0);
    });
  });

  if (bookingDialog) {
    const observer = new MutationObserver(() => {
      if (!bookingDialog.open) return;
      if (!serviceSelect?.value) chooseService('Free 15-minute fit check');
      else syncBookingChoices(serviceSelect.value);
    });
    observer.observe(bookingDialog, { attributes: true, attributeFilter: ['open'] });
  }

  syncBookingChoices(serviceSelect?.value || 'Free 15-minute fit check');

  /* Keep the active Centaiva layer visible in its horizontal mobile tab row. */
  document.querySelectorAll('[data-product-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 700px)').matches) {
        window.setTimeout(() => tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 0);
      }
    });
  });
})();
