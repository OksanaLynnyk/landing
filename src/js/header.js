document.addEventListener('DOMContentLoaded', () => {
  const menuOpen = document.querySelector('.menu-open');
  const menuClose = document.querySelector('.menu-close');
  const menuDropdown = document.querySelector('.header-dropdown');
  const menuLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, aside');
  const header = document.querySelector('header');

  const toggleButtons = () => {
    const isOpen = menuDropdown.classList.contains('open');
    const isMobile = window.innerWidth < 1442;

    if (isMobile) {
      menuOpen.style.display = isOpen ? 'none' : 'block';
      menuClose.style.display = isOpen ? 'block' : 'none';
    } else {
      menuOpen.style.display = '';
      menuClose.style.display = '';
    }
  };

  menuOpen.addEventListener('click', () => {
    menuDropdown.classList.add('open');
    toggleButtons();
  });

  menuClose.addEventListener('click', () => {
    menuDropdown.classList.remove('open');
    toggleButtons();
  });

  document.addEventListener('click', event => {
    if (
      !menuDropdown.contains(event.target) &&
      !menuOpen.contains(event.target) &&
      !menuClose.contains(event.target)
    ) {
      menuDropdown.classList.remove('open');
      toggleButtons();
    }
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuDropdown.classList.remove('open');
      toggleButtons();
      link.blur();
    });
  });

  toggleButtons();
  window.addEventListener('resize', toggleButtons);

  function highlightCurrentLink() {
    const currentPath = location.pathname.replace(/\/+$/, '');
    const currentHash = location.hash.slice(1);
    const isIndex = currentPath === '' || currentPath === '/' || currentPath === '/index.html';

    menuLinks.forEach(link => {
      const li = link.closest('.nav-item');

      li.classList.remove('active-true');

      const url = new URL(link.href, location.origin);
      const linkPath = url.pathname.replace(/\/+$/, '');
      const linkHash = url.hash.slice(1);

      const isSamePageNoHash = !linkHash && linkPath === currentPath && !currentHash;
      const isHashMatch = linkHash && linkHash === currentHash && isIndex;
      const isIndexLink = isIndex && !linkHash && (linkPath === '' || linkPath === '/index.html');

      if (isSamePageNoHash || isHashMatch || isIndexLink) {
        li.classList.add('active-true');
      }
    });
  }


  function smoothScrollTo(target, offset = 0, duration = 800) {
    const start = window.scrollY;
    const end = target === document.documentElement
      ? 0
      : target.getBoundingClientRect().top + start - offset;
    const change = end - start;
    const startTime = performance.now();

    function easeInOutQuad(t) {
      return t < 0.5
        ? 2 * t * t
        : -1 + (4 - 2 * t) * t;
    }

    function animateScroll(currentTime) {
      const time = (currentTime - startTime) / duration;
      const easedTime = easeInOutQuad(Math.min(time, 1));

      window.scrollTo(0, start + change * easedTime);

      if (time < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }

  menuLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const url = new URL(link.href, location.origin);
      const hash = url.hash;
      const currentPath = location.pathname.toLowerCase().replace(/\/+$/, '');
      const isIndexPage = ['', '/', '/index.html'].includes(currentPath);

      const linkPath = url.pathname.toLowerCase().replace(/\/+$/, '');

      if (!hash && isIndexPage && ['', '/', '/index.html'].includes(linkPath)) {
        e.preventDefault();

        if (window.scrollY > 0) {
          smoothScrollTo(document.documentElement, header.offsetHeight);
        }

        const newUrl = window.location.pathname + window.location.search;
        history.replaceState(null, '', newUrl);

        menuLinks.forEach(l => l.classList.remove('active-true'));
        this.classList.add('active-true');
        highlightCurrentLink();
      }

      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          menuLinks.forEach(l => l.classList.remove('active-true'));
          this.classList.add('active-true');
          smoothScrollTo(target, header.offsetHeight);
          history.replaceState(null, null, hash);
          highlightCurrentLink();
        }
      }
    });
  });

  highlightCurrentLink();
  window.addEventListener('hashchange', highlightCurrentLink);
  window.addEventListener('load', highlightCurrentLink);

  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    setTimeout(() => {
      document.body.classList.remove('preload');
    }, 400);
  })
});
