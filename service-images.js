/* Photos on the 8 service cards (Home + Services pages).
   Files live in img/services/ in the repo; on Vercel they are resized and turned into WebP
   by Vercel's image optimizer (vercel.json "images"), with the original PNG as fallback.
   Plain JS (no React) so the live site can also receive it through build.mjs. Safe to load twice. */
(() => {
  if (window.__dmSvcImg) return;
  window.__dmSvcImg = true;

  // same order as the cards: Strategy, Ad copy, Design, Paid ads, Reels, Brand kit, Page setup, Audit & training
  const IMAGES = [
    ['391eb178-image.png', 'Content calendar planner on a laptop'],
    ['40854cd7-image.png', 'Writing ad copy in a notebook beside a laptop'],
    ['080b96c6-image.png', 'Social media post designed in a brand kit'],
    ['834c4034-image.png', 'Digital ads dashboard with performance charts'],
    ['927a0e8b-image.png', 'Instagram Reels and Story on a phone'],
    ['e0037243-image.png', 'Digimetric logo sketches and brand kit'],
    ['2cafceba-image.png', 'Managing Facebook, TikTok, LINE and Instagram pages'],
    ['7fae9871-image.png', 'Team reviewing marketing reports in a workshop'],
  ];
  const BASE = '/img/services/';
  const onVercel = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const opt = (file, w) => `/_vercel/image?url=${encodeURIComponent(BASE + file)}&w=${w}&q=72`;

  const CSS = `
  #service-list .card{overflow:hidden}
  #service-list .card-img{margin:-28px -28px 4px;aspect-ratio:4/3;overflow:hidden;background:#0b1424;border-bottom:1px solid rgba(255,255,255,.08)}
  #service-list .card-img img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.001);transition:transform .6s cubic-bezier(.2,.7,.2,1)}
  #service-list .card:hover .card-img img{transform:scale(1.05)}
  @media(max-width:600px){
    #service-list .card-img{grid-column:1/-1;margin:-16px -16px 10px;aspect-ratio:16/9}
    #service-list .card:has(.card-img) .ico{grid-row:2/4}
    #service-list .card:has(.card-img) h3,#service-list .card:has(.card-img) p{grid-column:2}
  }
  @media(prefers-reduced-motion:reduce){#service-list .card-img img{transition:none}}`;

  const sync = () => {
    const cards = document.querySelectorAll('#service-list .card');
    cards.forEach((card, i) => {
      const item = IMAGES[i];
      if (!item || card.querySelector('.card-img')) return;
      const [file, alt] = item;
      const box = document.createElement('div');
      box.className = 'card-img';
      const img = document.createElement('img');
      img.alt = alt; img.loading = 'lazy'; img.decoding = 'async'; img.width = 640; img.height = 480;
      if (onVercel) {
        img.src = opt(file, 640);
        img.srcset = `${opt(file, 640)} 640w, ${opt(file, 1080)} 1080w`;
        img.sizes = '(max-width: 600px) 100vw, 340px';
        img.onerror = () => { img.onerror = null; img.removeAttribute('srcset'); img.src = BASE + file; };
      } else img.src = BASE + file;
      box.appendChild(img);
      card.prepend(box);
    });
  };

  const start = () => {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    let q = false;
    new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(() => { q = false; sync(); }); } })
      .observe(document.body, { childList: true, subtree: true });
    sync();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
