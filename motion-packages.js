/* Motion Video Editing packages — shown on the Services page, under the main packages.
   Plain JS (no React) so the live site can also receive it through build.mjs on Vercel.
   Safe to load twice: the second copy does nothing. */
(() => {
  if (window.__dmMotion) return;
  window.__dmMotion = true;

  const TX = {
    en: {
      ey: 'Motion video', h: 'Motion Video Editing Packages',
      sub: 'Professional motion graphics and video editing that lifts your brand, promotes your business and engages your audience across social media. Create. Animate. Engage.',
      unit: 'THB', cta: 'Get this package', vids: n => `${n} videos`,
      pk: [['Starter', 'Start smart. Create more.', 'Minimum 4 motion videos'],
           ['Standard', 'More content. More engagement.', '10 motion videos'],
           ['Premium', 'Create more. Grow faster.', '15 motion videos']],
      common: ['30 seconds – 1 minute per video', 'Professional motion video editing', 'Voiceover included', 'Choice of male / female voiceover'],
      exT: 'Additional charges', exH: 'Extra video duration',
      exP: 'An additional 300 THB applies for every extra 15 seconds on videos longer than the included duration.',
      voT: 'Voiceover options', voH: 'Choose your preferred voice', vo: ['Male voiceover', 'Female voiceover'],
      voP: 'Select the voice that best matches your brand and content style.',
    },
    th: {
      ey: 'โมชันวิดีโอ', h: 'แพ็กเกจตัดต่อโมชันวิดีโอ',
      sub: 'บริการโมชันกราฟิกและตัดต่อวิดีโอระดับมืออาชีพ ยกระดับแบรนด์ โปรโมตธุรกิจ และดึงดูดผู้ชมบนโซเชียลมีเดีย',
      unit: 'THB', cta: 'เลือกแพ็กเกจนี้', vids: n => `${n} วิดีโอ`,
      pk: [['Starter', 'เริ่มต้นอย่างชาญฉลาด สร้างได้มากกว่า', 'ขั้นต่ำ 4 โมชันวิดีโอ'],
           ['Standard', 'คอนเทนต์มากขึ้น เอนเกจมากขึ้น', 'โมชันวิดีโอ 10 ชิ้น'],
           ['Premium', 'สร้างมากขึ้น เติบโตเร็วขึ้น', 'โมชันวิดีโอ 15 ชิ้น']],
      common: ['30 วินาที – 1 นาที ต่อวิดีโอ', 'ตัดต่อโมชันวิดีโอระดับมืออาชีพ', 'รวมเสียงพากย์', 'เลือกเสียงพากย์ชาย / หญิงได้'],
      exT: 'ค่าบริการเพิ่มเติม', exH: 'ความยาววิดีโอเพิ่มเติม',
      exP: 'คิดเพิ่ม 300 บาท ทุก ๆ 15 วินาทีที่เกินจากความยาวที่รวมในแพ็กเกจ',
      voT: 'ตัวเลือกเสียงพากย์', voH: 'เลือกเสียงที่คุณชอบ', vo: ['เสียงพากย์ชาย', 'เสียงพากย์หญิง'],
      voP: 'เลือกเสียงที่เข้ากับแบรนด์และสไตล์คอนเทนต์ของคุณ',
    },
    zh: {
      ey: '动态视频', h: '动态视频剪辑套餐',
      sub: '专业动态图形与视频剪辑服务，提升品牌形象、推广业务，并在社交媒体上吸引受众。',
      unit: 'THB', cta: '选择此套餐', vids: n => `${n} 个视频`,
      pk: [['Starter', '聪明起步，创作更多。', '至少 4 个动态视频'],
           ['Standard', '更多内容，更多互动。', '10 个动态视频'],
           ['Premium', '创作更多，增长更快。', '15 个动态视频']],
      common: ['每个视频 30 秒 – 1 分钟', '专业动态视频剪辑', '含配音', '可选男声 / 女声配音'],
      exT: '附加费用', exH: '超出视频时长',
      exP: '视频超出套餐所含时长时，每多 15 秒加收 300 泰铢。',
      voT: '配音选项', voH: '选择您喜欢的声音', vo: ['男声配音', '女声配音'],
      voP: '选择最符合您品牌与内容风格的声音。',
    },
  };
  const PRICES = [[4, '3,000'], [10, '7,000'], [15, '10,000']];

  const CSS = `
  #motion-packages{margin-top:72px}
  #motion-packages .head{margin-bottom:28px}
  #motion-packages .mv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:18px}
  #motion-packages .mv-count{display:inline-flex;align-self:flex-start;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;color:#F2DC9B;border:1px solid rgba(242,220,155,.4);background:rgba(242,220,155,.08)}
  #motion-packages .mv-count svg{width:15px;height:15px}
  #motion-packages .pkc .d{min-height:0}
  #motion-packages .mv-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px;margin-top:18px}
  #motion-packages .mv-box{border:1px solid rgba(95,208,225,.22);border-radius:20px;padding:24px 26px;background:linear-gradient(145deg,rgba(28,40,66,.6),rgba(10,16,32,.7));display:grid;gap:10px;align-content:start}
  #motion-packages .mv-box small{font-size:12px;letter-spacing:.02em;color:#5FD0E1;font-weight:600}
  #motion-packages .mv-box h4{margin:0;font-size:18px;color:#fff}
  #motion-packages .mv-box p{margin:0;font-size:14px;line-height:1.6;color:#C7D2E3}
  #motion-packages .mv-box b{color:#F2DC9B}
  #motion-packages .mv-chips{display:flex;flex-wrap:wrap;gap:10px}
  #motion-packages .mv-chips span{display:inline-flex;align-items:center;gap:8px;font-size:14px;padding:8px 14px;border-radius:999px;border:1px solid rgba(95,208,225,.3);color:#E4E9F2}
  #motion-packages .mv-chips svg{width:15px;height:15px;color:#F2DC9B}
  @media(max-width:600px){#motion-packages{margin-top:52px}}`;

  const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/></svg>';
  const ICON_MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const langKey = () => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return l.startsWith('th') ? 'th' : l.startsWith('zh') ? 'zh' : 'en';
  };

  const html = k => {
    const t = TX[k];
    const cards = t.pk.map(([name, tag, first], i) => {
      const [n, price] = PRICES[i]; const hi = i === 1;
      const feats = [first, ...t.common].map(f => `<li>${esc(f)}</li>`).join('');
      return `<div class="pkc${hi ? ' hi' : ''}">
        <span class="mv-count">${ICON_PLAY}${esc(t.vids(n))}</span>
        <h3>${esc(name)}</h3>
        <p class="d">${esc(tag)}</p>
        <p class="price"><b>${price}</b><span>${t.unit}</span></p>
        <ul>${feats}</ul>
        <a class="btn ${hi ? 'gold' : 'ghost'}" href="#consultation">${esc(t.cta)}</a>
      </div>`;
    }).join('');
    return `<div class="head"><p class="eyebrow">${esc(t.ey)}</p><h2>${esc(t.h)}</h2><p class="sub">${esc(t.sub)}</p></div>
      <div class="mv-grid">${cards}</div>
      <div class="mv-info">
        <div class="mv-box"><small>${esc(t.exT)}</small><h4>${esc(t.exH)}</h4><p>${esc(t.exP).replace('300', '<b>300</b>')}</p></div>
        <div class="mv-box"><small>${esc(t.voT)}</small><h4>${esc(t.voH)}</h4>
          <div class="mv-chips">${t.vo.map(v => `<span>${ICON_MIC}${esc(v)}</span>`).join('')}</div><p>${esc(t.voP)}</p></div>
      </div>`;
  };

  let shownLang = '';
  const sync = () => {
    const pk = document.getElementById('packages');
    // Services page = packages section + a page hero (Home has packages but no page hero)
    const onServices = pk && document.querySelector('.ph');
    let box = document.getElementById('motion-packages');
    if (!onServices) { if (box) box.remove(); return; }
    const wrap = pk.querySelector('.wrap') || pk;
    const k = langKey();
    if (!box || box.parentNode !== wrap) {
      box = document.createElement('div');
      box.id = 'motion-packages';
      wrap.appendChild(box);
      shownLang = '';
    }
    if (shownLang !== k) { box.innerHTML = html(k); shownLang = k; }
  };

  const start = () => {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    let queued = false;
    const later = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; sync(); }); } };
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    sync();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
