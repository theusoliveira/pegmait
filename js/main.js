/* =============================================================
   PEGMA IT — Interações globais (menu, scroll, formulários)
   - Sem dependências
   - Funciona para / e /ainfraspend
   ============================================================= */

(() => {
  const header = document.querySelector('.header');

  // -------------------------
  // Header: efeito de scroll
  // -------------------------
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -------------------------
  // Smooth scroll com offset
  // -------------------------
  const getHeaderOffset = () => (header ? header.offsetHeight + 8 : 72);

  const smoothScrollTo = (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(href);
    });
  });

  // -------------------------
  // Destaque de seção ativa
  // -------------------------
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navLinks.length && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const id = '#' + visible.target.id;
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === id));
      },
      { rootMargin: `-${getHeaderOffset()}px 0px -70% 0px`, threshold: [0.15, 0.3, 0.6] }
    );

    sections.forEach((s) => io.observe(s));
  }

  // -------------------------
  // Menu mobile (sidebar)
  // -------------------------
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuSidebar = document.getElementById('mobileMenuSidebar');
  const body = document.body;

  const openMobileMenu = () => {
    if (!mobileMenuOverlay || !mobileMenuSidebar) return;
    mobileMenuOverlay.classList.add('active');
    mobileMenuSidebar.classList.add('active');
    body.classList.add('mobile-menu-open');

    // Foco no primeiro link
    const firstLink = mobileMenuSidebar.querySelector('a, button');
    firstLink?.focus?.();
  };

  const closeMobileMenu = () => {
    mobileMenuOverlay?.classList.remove('active');
    mobileMenuSidebar?.classList.remove('active');
    body.classList.remove('mobile-menu-open');
  };

  mobileMenuToggle?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuOverlay?.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.mobile-menu-link').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) closeMobileMenu();
  });

  // -------------------------
  // Animações de entrada (reveal)
  // -------------------------
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (!prefersReduced && 'IntersectionObserver' in window && revealEls.length) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          revealIO.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealIO.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-revealed'));
  }

  // -------------------------
  // Form helpers
  // -------------------------
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

  const showError = (field, message) => {
    const id = field.getAttribute('id');
    if (!id) return;
    field.setAttribute('aria-invalid', 'true');
    const err = document.getElementById(`${id}Error`);
    if (err) {
      err.textContent = message;
      err.style.display = 'block';
    }
  };

  const clearError = (field) => {
    const id = field.getAttribute('id');
    if (!id) return;
    field.removeAttribute('aria-invalid');
    const err = document.getElementById(`${id}Error`);
    if (err) err.style.display = 'none';
  };

  const setBusy = (btn, busy) => {
    if (!btn) return;
    btn.disabled = busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
  };

  const serializeForm = (form) => {
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => {
      obj[key] = String(value);
    });
    return obj;
  };

  // -------------------------
  // Form: Contato (landing)
  // - data-endpoint="https://..."
  // - se vazio, abre mailto
  // -------------------------
  const wireLeadForm = (formId, options = {}) => {
    const form = document.getElementById(formId);
    if (!form) return;

    const success = document.getElementById(options.successId || 'successMessage');
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.innerHTML;

    // limpar erros no input
    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      success && (success.style.display = 'none');

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');

      let ok = true;
      if (name && String(name.value).trim().length < 3) {
        showError(name, 'Por favor, informe seu nome.');
        ok = false;
      }
      if (email && !validateEmail(email.value)) {
        showError(email, 'Por favor, informe um e-mail válido.');
        ok = false;
      }
      if (message && String(message.value).trim().length < 10) {
        showError(message, 'Por favor, descreva sua necessidade (mín. 10 caracteres).');
        ok = false;
      }
      if (!ok) return;

      const payload = serializeForm(form);
      const endpoint = (form.getAttribute('data-endpoint') || '').trim();

      // fallback: mailto
      if (!endpoint) {
        const subject = encodeURIComponent(options.mailSubject || 'Contato — PEGMA IT');
        const bodyLines = [
          `Nome: ${payload.name || ''}`,
          `E-mail: ${payload.email || ''}`,
          `Empresa: ${payload.company || ''}`,
          '',
          (payload.message || '').trim(),
        ];

        const body = encodeURIComponent(bodyLines.join('\n'));
        window.location.href = `mailto:${options.mailTo || 'contato@pegmait.com.br'}?subject=${subject}&body=${body}`;

        success && (success.style.display = 'block');
        form.reset();
        return;
      }

      try {
        setBusy(submitBtn, true);
        if (submitBtn) submitBtn.innerHTML = '<span class="loader"></span> Enviando…';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        success && (success.style.display = 'block');
        form.reset();
        success?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        alert('Houve um erro ao enviar. Se preferir, entre em contato por e-mail/WhatsApp.');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setBusy(submitBtn, false);
        if (submitBtn && originalText) submitBtn.innerHTML = originalText;
      }
    });
  };

  // Landing principal
  wireLeadForm('contactForm', { mailTo: 'contato@pegmait.com.br', mailSubject: 'Contato — PEGMA IT' });

  // -------------------------
  // Form: AInfraspend
  // - exige endpoint; não fazemos fallback via mailto (dados sensíveis)
  // -------------------------
  const wireAinfraspendForm = () => {
    const form = document.getElementById('ainfraspendForm');
    if (!form) return;

    const success = document.getElementById('ainfraspendSuccess');
    const warning = document.getElementById('ainfraspendWarning');
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.innerHTML;

    form.querySelectorAll('input').forEach((field) => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    const toggleButtons = form.querySelectorAll('[data-toggle-secret]');
    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-secret');
        const input = id ? document.getElementById(id) : null;
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? 'Mostrar' : 'Ocultar';
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      success && (success.style.display = 'none');
      warning && (warning.style.display = 'none');

      const email = form.querySelector('#email');
      if (email && !validateEmail(email.value)) {
        showError(email, 'Por favor, informe um e-mail válido.');
        return;
      }

      const endpoint = (form.getAttribute('data-endpoint') || '').trim();
      if (!endpoint) {
        if (warning) {
          warning.style.display = 'block';
          warning.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert('Configuração pendente: defina data-endpoint no formulário do AInfraspend.');
        }
        return;
      }

      const payload = serializeForm(form);

      try {
        setBusy(submitBtn, true);
        if (submitBtn) submitBtn.innerHTML = '<span class="loader"></span> Enviando…';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        success && (success.style.display = 'block');
        form.reset();
        success?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        alert('Houve um erro ao enviar. Tente novamente ou entre em contato com o suporte.');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setBusy(submitBtn, false);
        if (submitBtn && originalText) submitBtn.innerHTML = originalText;
      }
    });
  };

  wireAinfraspendForm();
})();
