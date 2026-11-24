/* Free consultation form: "Social media channels" choice under Business / Page name.
   Adds the chips to the form and puts the visitor's choices into the request that
   /api/consult emails to Digimetric. Plain JS (no React) so the live site can also
   receive it through build.mjs on Vercel. Safe to load twice. */
(() => {
  if (window.__dmSocial) return;
  window.__dmSocial = true;

  const CHANNELS = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LINE OA', 'Telegram', 'X (Twitter)', 'Website'];
  const TX = {
    en: ['Social media channels', '(optional — choose all you have)'],
    th: ['ช่องทางโซเชียลมีเดีย', '(ไม่บังคับ — เลือกได้หลายช่องทาง)'],
    zh: ['社交媒体渠道', '（选填，可多选）'],
  };
  const chosen = new Set();
  const langKey = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return l.startsWith('th') ? 'th' : l.startsWith('zh') ? 'zh' : 'en';
  };

  const build = () => {
    const fs = document.createElement('fieldset');
    fs.className = 'cf-field'; fs.id = 'cf-social';
    fs.innerHTML = '<legend><span class="cf-social-l"></span> <em class="cf-opt"></em></legend><div class="cf-chips"></div>';
    const box = fs.querySelector('.cf-chips');
    for (const c of CHANNELS) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = c; b.setAttribute('aria-pressed', String(chosen.has(c)));
      b.addEventListener('click', () => {
        chosen.has(c) ? chosen.delete(c) : chosen.add(c);
        b.setAttribute('aria-pressed', String(chosen.has(c)));
      });
      box.appendChild(b);
    }
    return fs;
  };

  const sync = () => {
    const biz = document.getElementById('cf-biz');
    if (!biz) return;
    // the row that holds the Business / Page name field
    const row = biz.closest('.cf-row') || biz.closest('.cf-field');
    if (!row) return;
    let fs = document.getElementById('cf-social');
    if (!fs || fs.previousElementSibling !== row) { if (fs) fs.remove(); fs = build(); row.after(fs); }
    const [label, opt] = TX[langKey()];
    const l = fs.querySelector('.cf-social-l'); if (l.textContent !== label) l.textContent = label;
    const o = fs.querySelector('.cf-opt'); if (o.textContent !== opt) o.textContent = opt;
  };

  // add the choices to the request the form sends to /api/consult
  const origFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    try {
      const url = typeof input === 'string' ? input : input && input.url;
      if (url && /\/api\/consult$/.test(url) && init && typeof init.body === 'string' && chosen.size) {
        const data = JSON.parse(init.body);
        const list = CHANNELS.filter(c => chosen.has(c)).join(', ');
        data['Social media'] = list;
        if (typeof data.Message === 'string') {
          const lines = data.Message.split('\n');
          let at = lines.findIndex(x => x.startsWith('Business / page:'));
          if (at < 0) at = lines.findIndex(x => x.startsWith('Name:'));
          lines.splice(at + 1, 0, `Social media: ${list}`);
          data.Message = lines.join('\n');
        }
        init = { ...init, body: JSON.stringify(data) };
      }
    } catch (e) { /* send the request unchanged */ }
    return origFetch(input, init);
  };

  const start = () => {
    let queued = false;
    const later = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; sync(); }); } };
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    sync();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
