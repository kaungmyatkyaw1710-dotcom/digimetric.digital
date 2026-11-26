/* Adds 8 more logos to "Brands We Work With" on the live site and updates the client count.
   Files live in img/clients/ in the repo (resized by Vercel's image optimizer). Safe to load twice. */
(() => {
  if (window.__dmClients) return;
  window.__dmClients = true;
  const LOGOS = [
    ['1/image.png', 'Trends in Asia'],
    ['2/image.png', 'LingoPath Language Center'],
    ['3/image.png', 'Nine Elephant Group'],
    ['4/image.png', 'AKM Travel & Tour'],
    ['5/image.png', 'Easy Visa for Myanmar'],
    ['6/image.png', 'Global Talent Connect'],
    ['7/image.png', 'AIW Network Enterprise'],
    ['8/image.png', 'Navara International'],
  ];
  const BASE = '/img/clients/';
  const onVercel = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const src = (f) => f.startsWith('data:') ? f : onVercel ? `/_vercel/image?url=${encodeURIComponent(BASE + f)}&w=640&q=75` : BASE + f;
  const WORDS = /^(\d+)(\s+(businesses|ธุรกิจ|家企业))$/;

  const sync = () => {
    const grid = document.querySelector('#clients .cl-grid');
    let total = 0;
    if (grid) {
      if (!grid.querySelector('[data-dm-extra]')) {
        const have = new Set([...grid.querySelectorAll('img')].map((i) => i.alt));
        LOGOS.forEach(([file, name]) => {
          if (have.has(name)) return;
          const li = document.createElement('li');
          li.className = 'cl-tile rv in'; li.dataset.dmExtra = '1';
          const img = document.createElement('img');
          img.src = src(file); img.alt = name; img.title = name; img.loading = 'lazy';
          img.onerror = () => { img.onerror = null; img.src = BASE + file; };
          li.appendChild(img); grid.appendChild(li);
        });
      }
      total = grid.children.length;
      const b = document.querySelector('#clients .cl-top .sub b');
      if (b && b.textContent !== String(total)) b.textContent = total;
    }
    // About page fact "24 businesses"
    const extra = LOGOS.length;
    document.querySelectorAll('li').forEach((li) => {
      if (li.dataset.dmCount) return;
      for (const n of li.childNodes) {
        if (n.nodeType !== 3) continue;
        const m = n.textContent.match(WORDS);
        if (m) { n.textContent = (total || +m[1] + extra) + m[2]; li.dataset.dmCount = '1'; }
      }
    });
  };
  const start = () => {
    let q = false;
    new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(() => { q = false; sync(); }); } })
      .observe(document.body, { childList: true, subtree: true });
    sync();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
