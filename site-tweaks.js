/* Live-site tweaks applied by build.mjs on Vercel (the React source already has them):
   - the Free Consultation form section is removed: hidden, and every link that pointed
     to it (#consultation) now opens the Contact page instead. Safe to load twice. */
(() => {
  if (window.__dmTweaks) return;
  window.__dmTweaks = true;

  const st = document.createElement('style');
  st.textContent = '#consultation{display:none!important}.ph a[data-was-consult],.foot-links a[data-was-consult]{display:none!important}';
  document.head.appendChild(st);

  const fix = () => {
    for (const a of document.querySelectorAll('a[href="#consultation"]')) {
      a.setAttribute('href', '#contact');
      // the Contact page header had a "Free consultation" button pointing at the form: drop it
      if (a.closest('.ph') && document.getElementById('consultation')) a.setAttribute('data-was-consult', '');
      // the footer already links to Contact Us: drop the duplicate
      if (a.closest('.foot-links')) a.setAttribute('data-was-consult', '');
    }
  };
  // rewrite before the site's router reads the link
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href="#consultation"]'); if (a) a.setAttribute('href', '#contact'); }, true);
  const start = () => {
    let q = false;
    new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(() => { q = false; fix(); }); } })
      .observe(document.body, { childList: true, subtree: true });
    fix();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
