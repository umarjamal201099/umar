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

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const raw = link.getAttribute('href');
    if (!raw || raw === '#') return;
    let target = null;
    try { target = document.querySelector(raw); } catch { return; }
    if (!target) return;

    event.preventDefault();
    const headerOffset = Math.max(header?.offsetHeight || 64, 64) + 24;
    const targetY = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);
    const distance = Math.abs(targetY - window.scrollY);
    const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && distance <= window.innerHeight * 1.35;
    window.scrollTo({ top: targetY, behavior: canAnimate ? 'smooth' : 'auto' });

    try { history.pushState(null, '', raw); } catch { /* Ignore history failures on local/file contexts. */ }
    if (target.id === 'main') {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
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
  nav?.querySelectorAll('a, button').forEach((item) => item.addEventListener('click', () => setMenu(false)));
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

  const selectArchitectureNode = (node) => {
    if (!node) return;
    architectureNodes.forEach((item) => {
      const active = item === node;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (architectureTitle) architectureTitle.textContent = node.dataset.title || '';
    if (architectureCopy) architectureCopy.textContent = node.dataset.copy || '';
    if (architecturePitch) architecturePitch.textContent = pitchByKey[node.dataset.archKey] || '';
    if (architectureIndex) {
      const raw = node.querySelector('span')?.textContent || '';
      architectureIndex.textContent = raw.match(/\d{2}/)?.[0] || '—';
    }
  };

  architectureNodes.forEach((node) => {
    node.setAttribute('aria-pressed', String(node.classList.contains('is-active')));
    node.addEventListener('mouseenter', () => selectArchitectureNode(node));
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
      architectureModeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const preferred = architectureNodes.find((node) => node.dataset.archKey === modeDefaultNode[mode]);
      selectArchitectureNode(preferred);
    });
  });

  /* Subtle screen depth — deliberately restrained and disabled on touch/reduced-motion. */
  const tiltScreen = document.querySelector('[data-tilt-screen]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (tiltScreen && !reducedMotion.matches && window.matchMedia('(pointer:fine)').matches) {
    tiltScreen.addEventListener('pointermove', (event) => {
      const rect = tiltScreen.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tiltScreen.style.transform = `perspective(1600px) rotateX(${(-y * 0.8).toFixed(2)}deg) rotateY(${(x * 0.8).toFixed(2)}deg)`;
    });
    tiltScreen.addEventListener('pointerleave', () => {
      tiltScreen.style.transform = '';
    });
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

  /* Keep the fixed navigation oriented to the section currently in view. */
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const navSections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section);

  if ('IntersectionObserver' in window && navSections.length) {
    const activeSections = new Map();
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => activeSections.set(entry.target.id, entry.intersectionRatio));
      const best = [...activeSections.entries()]
        .filter(([, ratio]) => ratio > 0)
        .sort((a, b) => b[1] - a[1])[0];
      navLinks.forEach((link) => link.removeAttribute('aria-current'));
      if (best) {
        navSections.find(({ section }) => section.id === best[0])?.link.setAttribute('aria-current', 'page');
      }
    }, { rootMargin: `-${Math.max(header?.offsetHeight || 64, 64)}px 0px -58% 0px`, threshold: [0.08, 0.25, 0.5, 0.75] });
    navSections.forEach(({ section }) => navObserver.observe(section));
  }
})();
