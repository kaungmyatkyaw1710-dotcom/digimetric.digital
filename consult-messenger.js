/* Free consultation form → Digimetric Facebook Page Messenger.
   On "Send my request" the visitor's details open in a Messenger chat with the page
   (m.me link with the request already written); the visitor taps Send once.
   Meta does not let a website post into a Page inbox by itself — the visitor must send it.
   Plain JS (no React) so the live site can also receive it through build.mjs on Vercel.
   Safe to load twice: the second copy does nothing. */
(() => {
  if (window.__dmMsgr) return;
  window.__dmMsgr = true;

  const PAGE = 'digimetricdigital';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const TX = {
    en: { title: 'Almost done — send it in Messenger', sub: 'Your request is written in a Messenger chat with Digimetric. Tap Send there and it reaches our page inbox.',
          btn: 'Open Messenger', note: 'If the message is empty in Messenger, paste it (it is already copied) and tap Send.' },
    th: { title: 'เกือบเสร็จแล้ว — ส่งใน Messenger', sub: 'คำขอของคุณถูกเขียนไว้ในแชท Messenger กับ Digimetric แล้ว กดส่งในแชทเพื่อส่งถึงเพจของเรา',
          btn: 'เปิด Messenger', note: 'หากข้อความใน Messenger ว่าง ให้วาง (คัดลอกไว้แล้ว) แล้วกดส่ง' },
    zh: { title: '即将完成 — 在 Messenger 中发送', sub: '您的申请已写入与 Digimetric 的 Messenger 对话中，点击发送即可送达我们的主页收件箱。',
          btn: '打开 Messenger', note: '如果 Messenger 中消息为空，请粘贴（已为您复制）后点击发送。' },
  };
  const langKey = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return l.startsWith('th') ? 'th' : l.startsWith('zh') ? 'zh' : 'en';
  };

  const val = id => (document.getElementById(id)?.value || '').trim();
  const selText = id => { const s = document.getElementById(id); return s && s.value !== '' ? (s.options[s.selectedIndex]?.text || '').trim() : ''; };
  const pressed = i => {
    const g = document.querySelectorAll('#consultation .cf-chips')[i];
    return g ? [...g.querySelectorAll('button[aria-pressed="true"]')].map(b => b.textContent.trim()) : [];
  };

  let lastMessage = '';
  const build = () => {
    const btypeSel = document.getElementById('cf-btype');
    const isOther = btypeSel && btypeSel.value !== '' && btypeSel.selectedIndex === btypeSel.options.length - 1;
    const btype = isOther ? (val('cf-btype-other') || selText('cf-btype')) : selText('cf-btype');
    const phone = `${val('cf-dial')} ${val('cf-phone').replace(/^0+/, '')}`.trim();
    const [channel] = pressed(0); const services = pressed(1); const [pkg] = pressed(2);
    return [
      'New free consultation request — Digimetric website',
      `Name: ${val('cf-name')}`,
      val('cf-biz') && `Business / page: ${val('cf-biz')}`,
      btype && `Business type: ${btype}`,
      `Phone: ${phone}`,
      val('cf-email') && `Email: ${val('cf-email')}`,
      channel && `Preferred contact: ${channel}`,
      services.length && `Services: ${services.join(', ')}`,
      pkg && `Package: ${pkg}`,
      selText('cf-time') && `Best time: ${selText('cf-time')}`,
      val('cf-msg') && `Goals: ${val('cf-msg')}`,
    ].filter(Boolean).join('\n');
  };
  // same checks as the form, so Messenger opens only when the form accepts the request
  const valid = () => {
    if (!val('cf-name') || val('cf-phone').replace(/\D/g, '').length < 6) return false;
    const email = val('cf-email');
    if (email && !EMAIL_RE.test(email)) return false;
    if (pressed(0)[0] === 'Email' && !email) return false;
    return true;
  };
  const link = msg => `https://m.me/${PAGE}?text=${encodeURIComponent(msg.slice(0, 1800))}`;
  const openMessenger = msg => {
    try { navigator.clipboard?.writeText(msg).catch(() => {}); } catch (e) {}
    const w = window.open(link(msg), '_blank');
    if (w) { try { w.opener = null; } catch (e) {} }
    else location.href = link(msg); // popup blocked: go there in this tab
  };

  // "Send my request" (click or Enter) → open Messenger right away, while the tap still counts
  const onSubmit = e => {
    const form = e.target.closest ? e.target.closest('#consultation form') : null;
    if (!form) return;
    if (e.type === 'click' && !e.target.closest('.cf-submit')) return;
    if (!valid()) return; // the form shows its own error message
    lastMessage = build();
    openMessenger(lastMessage);
  };
  document.addEventListener('click', onSubmit, true);
  document.addEventListener('submit', e => { if (e.submitter) return; onSubmit(e); }, true);

  // done screen: Messenger first
  const CSS = `
  #consultation .cf-msgr{order:-1;background:linear-gradient(135deg,#F5E09A,#C9B57A)!important;color:#1a1405!important;border-color:rgba(245,224,154,.7)!important}
  #consultation .cf-msgr svg{width:17px;height:17px}
  #consultation .cf-msgr-note{margin:10px 0 0;font-size:13px;color:#C7D2E3}
  #consultation .cf-send{display:flex;flex-wrap:wrap}
  #consultation .cf-send .cf-msgr ~ .btn.gold{background:linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.05))!important;color:#fff!important;border-color:rgba(255,255,255,.28)!important;box-shadow:none!important}`;
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.4S17 3 12 3z"/><path d="m7.5 13.5 3-3 2.5 2 3.5-3.5"/></svg>';

  const sync = () => {
    const done = document.querySelector('#consultation .cf-done');
    if (!done || !lastMessage) return;
    const t = TX[langKey()];
    const h = done.querySelector('h3'); if (h && h.textContent !== t.title) h.textContent = t.title;
    const s = done.querySelector('p.sub'); if (s && s.textContent !== t.sub) s.textContent = t.sub;
    const row = done.querySelector('.cf-send');
    if (row) {
      let b = row.querySelector('.cf-msgr');
      if (!b) {
        b = document.createElement('a');
        b.className = 'btn cf-msgr'; b.target = '_blank'; b.rel = 'noopener noreferrer';
        b.addEventListener('click', () => { try { navigator.clipboard?.writeText(lastMessage).catch(() => {}); } catch (e) {} });
        row.prepend(b);
      }
      b.href = link(lastMessage);
      const label = ICON + t.btn; if (b.innerHTML !== label) b.innerHTML = label;
      let n = done.querySelector('.cf-msgr-note');
      if (!n) { n = document.createElement('p'); n.className = 'cf-msgr-note'; row.after(n); }
      if (n.textContent !== t.note) n.textContent = t.note;
    }
  };

  const start = () => {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    let queued = false;
    const later = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; sync(); }); } };
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true, characterData: true });
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
