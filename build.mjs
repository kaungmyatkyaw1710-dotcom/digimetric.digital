// Vercel build step (runs because of "buildCommand" in vercel.json).
// 1. Takes index.html from the repo. If it is missing, downloads the last uploaded
//    version from the repo history (FALLBACK_COMMIT), so the site never goes blank.
// 2. Applies the small text edits below, so a text change does not need a new
//    2.6 MB upload. Upload a new index.html later and the edits are simply skipped.
// 3. Adds the small scripts in EXTRA_SCRIPTS (motion video packages, social media channel
//    choice on the consultation form) unless index.html already contains them.
// The consultation form posts to api/consult.js, which emails the request to Gmail.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const REPO = 'kaungmyatkyaw1710-dotcom/digimetric.digital';
const FALLBACK_COMMIT = 'a2a945e7ac96c18c2ee1da75cbe9d8bf4ca87fcf';

const EDITS = [
  // About page subtitle: remove "Myanmar" (EN / TH / ZH)
  ['agency for Myanmar business owners in Thailand.', 'agency for business owners in Thailand.'],
  ['ในกรุงเทพฯ สำหรับเจ้าของธุรกิจชาวเมียนมาในประเทศไทย', 'ในกรุงเทพฯ สำหรับเจ้าของธุรกิจในประเทศไทย'],
  ['为在泰缅甸企业主服务', '为在泰企业主服务'],
  // Consultation form: send to our own /api/consult (Gmail SMTP) instead of FormSubmit
  ['`https://formsubmit.co/ajax/digimetric1710@gmail.com`', '`/api/consult`'],
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

const EXTRA_SCRIPTS = [
  ['motion-packages.js', '__dmMotion'],   // Motion Video Editing packages (Home + Services)
  ['consult-social.js', '__dmSocial'],    // Social media channels choice on the consultation form
];
for (const [file, marker] of EXTRA_SCRIPTS) {
  if (!existsSync(file) || html.includes(marker)) continue;
  const js = readFileSync(file, 'utf8');
  html = html.replace('</body>', () => `<script>\n${js}\n</script>\n</body>`);
  console.log('Added', file);
}

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log('Built dist/index.html,', html.length, 'bytes');
