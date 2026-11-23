// Vercel build step (runs because of "buildCommand" in vercel.json).
// 1. Takes index.html from the repo. If it is missing, downloads the last uploaded
//    version from the repo history (FALLBACK_COMMIT), so the site never goes blank.
// 2. Applies the small text edits below, so a text change does not need a new
//    2.6 MB upload. Upload a new index.html later and the edits are simply skipped.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const REPO = 'kaungmyatkyaw1710-dotcom/digimetric.digital';
const FALLBACK_COMMIT = 'a2a945e7ac96c18c2ee1da75cbe9d8bf4ca87fcf';

const EDITS = [
  // About page subtitle: remove "Myanmar" (EN / TH / ZH)
  ['agency for Myanmar business owners in Thailand.', 'agency for business owners in Thailand.'],
  ['ในกรุงเทพฯ สำหรับเจ้าของธุรกิจชาวเมียนมาในประเทศไทย', 'ในกรุงเทพฯ สำหรับเจ้าของธุรกิจในประเทศไทย'],
  ['为在泰缅甸企业主服务', '为在泰企业主服务'],
];

let html;
if (existsSync('index.html')) {
  html = readFileSync('index.html', 'utf8');
  console.log('Using index.html from the repo');
} else {
  const url = `https://raw.githubusercontent.com/${REPO}/${FALLBACK_COMMIT}/index.html`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download ${url}: ${res.status}`);
  html = await res.text();
  console.log('index.html missing in repo, using saved version', FALLBACK_COMMIT.slice(0, 7));
}

for (const [from, to] of EDITS) {
  const n = html.split(from).length - 1;
  if (n) { html = html.split(from).join(to); console.log(`Edited (${n}x):`, to); }
  else console.log('Skipped (not found):', from);
}

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log('Built dist/index.html,', html.length, 'bytes');
