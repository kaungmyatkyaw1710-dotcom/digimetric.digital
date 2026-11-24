/* Live-site tweaks applied by build.mjs on Vercel (the React source already has them):
   - the Free Consultation form section is removed, and the "Free consultation" buttons
     (hero, menu bar, page headers, mobile menu, footer) are removed too;
   - other links that pointed to the form (#consultation), such as "Get this package",
     now open the Contact page, and the end-of-page band button says "Contact Us".
   Safe to load twice. */
(() => {
  if (window.__dmTweaks) return;
  window.__dmTweaks = true;

  const HIDE_IN = '.gh-ctas,.nav,.ph,.overlay,.foot-links';
  const st = document.createElement('style');
  st.textContent = '#consultation{display:none!important}' +
    HIDE_IN.split(',').map(s => `${s} a[data-consult]`).join(',') + '{display:none!important}';
  document.head.appendChild(st);

  const CONTACT = { en: 'Contact Us', th: 'ติดต่อเรา', zh: '联系我们' };
  const langKey = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return l.startsWith('th') ? 'th' : l.startsWith('zh') ? 'zh' : 'en';
  };

  const fix = () => {
    for (const a of document.querySelectorAll('a[href="#consultation"]')) {
      a.setAttribute('href', '#contact');
      a.setAttribute('data-consult', '');
    }
    // end-of-page band: keep the button, now "Contact Us"
    for (const a of document.querySelectorAll('.ctab a[data-consult]')) {
      const tn = [...a.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim());
      const want = CONTACT[langKey()] + ' ';
      if (tn && tn.nodeValue !== want) tn.nodeValue = want;
    }
  };
  // rewrite before the site's router reads the link
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href="#consultation"]');
    if (a) a.setAttribute('href', '#contact');
  }, true);
  const start = () => {
    let q = false;
    const later = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; fix(); }); } };
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true, characterData: true });
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    fix();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
