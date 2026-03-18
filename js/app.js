/* ─────────────────────────────────────────────
   DEFAULT_CSS
   微信公众号兼容：禁止 ::before / ::after / @import url()
   ───────────────────────────────────────────── */
const DEFAULT_CSS = `
h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 28px 0 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid #d97757;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 24px 0 12px;
}

h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 20px 0 10px;
}

h4 {
  font-size: 15px;
  font-weight: 700;
  color: #3a3a3a;
  margin: 16px 0 8px;
}

p {
  font-size: 15px;
  line-height: 1.9;
  color: #3a3a3a;
  margin: 10px 0;
}

strong {
  font-weight: 700;
  color: #1a1a1a;
}

em {
  font-style: italic;
  color: #5a5550;
}

a {
  color: #d97757;
  text-decoration: none;
}

code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  background: #f0ece6;
  color: #c0392b;
  padding: 2px 6px;
  border-radius: 3px;
}

pre {
  background: #2d2d2d;
  padding: 18px 20px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

pre code {
  background: transparent;
  color: #f8f8f2;
  padding: 0;
  border-radius: 0;
  font-size: 13px;
  line-height: 1.6;
}

blockquote {
  border-left: 4px solid #d97757;
  padding: 4px 0 4px 16px;
  margin: 16px 0;
  color: #8a8278;
}

blockquote p {
  color: #8a8278;
  margin: 0;
}

ul, ol {
  padding-left: 24px;
  margin: 10px 0;
}

li {
  font-size: 15px;
  line-height: 1.9;
  color: #3a3a3a;
  margin: 4px 0;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
}

th {
  background: #f3f0eb;
  color: #1a1a1a;
  font-weight: 700;
  padding: 10px 14px;
  border: 1px solid #e8e3dc;
  text-align: left;
}

td {
  padding: 9px 14px;
  border: 1px solid #e8e3dc;
  color: #3a3a3a;
}

tr:nth-child(even) td {
  background: #faf9f7;
}

img {
  max-width: 100%;
  display: block;
  margin: 16px auto;
}

hr {
  border: none;
  border-top: 1px solid #e8e3dc;
  margin: 28px 0;
}
`.trim();

/* ─────────────────────────────────────────────
   marked 配置
   ───────────────────────────────────────────── */
marked.use({ gfm: true });

/* ─────────────────────────────────────────────
   CSS 内联（替代 juice，纯浏览器实现）
   ───────────────────────────────────────────── */
function inlineCSS(html, css) {
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const ruleRe = /([^{]+)\{([^}]+)\}/g;
  let m;
  while ((m = ruleRe.exec(cleanCss)) !== null) {
    rules.push({ selector: m[1].trim(), declarations: m[2].trim() });
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');

  for (const { selector, declarations } of rules) {
    let els;
    try { els = doc.querySelectorAll(selector); } catch { continue; }
    for (const el of els) {
      for (const decl of declarations.split(';')) {
        const idx = decl.indexOf(':');
        if (idx === -1) continue;
        const prop = decl.slice(0, idx).trim();
        const val  = decl.slice(idx + 1).trim();
        if (prop && val) el.style.setProperty(prop, val);
      }
    }
  }

  return doc.body.innerHTML;
}

/* ─────────────────────────────────────────────
   核心 Pipeline
   ───────────────────────────────────────────── */
function render() {
  const md  = document.getElementById('md-input').value;
  const css = document.getElementById('css-input').value;
  const rawHtml = marked.parse(md);
  const inlined = inlineCSS(rawHtml, css);
  document.getElementById('preview').innerHTML = inlined;
}

/* ─────────────────────────────────────────────
   Tab 切换（左栏：Markdown ↔ 样式 CSS）
   ───────────────────────────────────────────── */
function switchTab(tab) {
  const mdInput  = document.getElementById('md-input');
  const cssInput = document.getElementById('css-input');
  const tabMd    = document.getElementById('tab-md');
  const tabCss   = document.getElementById('tab-css');

  if (tab === 'md') {
    mdInput.style.display  = 'block';
    cssInput.style.display = 'none';
    tabMd.classList.add('active');
    tabCss.classList.remove('active');
  } else {
    mdInput.style.display  = 'none';
    cssInput.style.display = 'block';
    tabMd.classList.remove('active');
    tabCss.classList.add('active');
  }
}

/* ─────────────────────────────────────────────
   初始化
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // 填充默认 CSS
  document.getElementById('css-input').value = DEFAULT_CSS;

  // 事件绑定
  document.getElementById('md-input').addEventListener('input', render);
  document.getElementById('css-input').addEventListener('input', render);

  // 初始渲染
  render();
});
