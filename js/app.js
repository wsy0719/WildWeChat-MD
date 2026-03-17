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
   核心 Pipeline
   ───────────────────────────────────────────── */
function render() {
  const md  = document.getElementById('md-input').value;
  const css = document.getElementById('css-preview-input').value;
  const rawHtml = marked.parse(md);
  const inlined = juice.inlineContent(rawHtml, css);
  document.getElementById('preview').innerHTML = inlined;
}

/* ─────────────────────────────────────────────
   CSS 模式切换（右栏：预览 ↔ CSS 编辑器）
   ───────────────────────────────────────────── */
let cssMode = false;

function toggleCssMode() {
  cssMode = !cssMode;
  const preview = document.getElementById('preview');
  const cssInput = document.getElementById('css-preview-input');
  const btn = document.getElementById('css-toggle-btn');

  if (cssMode) {
    preview.style.display = 'none';
    cssInput.style.display = 'block';
    btn.classList.add('active');
    btn.textContent = '← 返回预览';
  } else {
    preview.style.display = 'block';
    cssInput.style.display = 'none';
    btn.classList.remove('active');
    btn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
      样式 CSS`;
    render();
  }
}

/* ─────────────────────────────────────────────
   文件导入
   ───────────────────────────────────────────── */
function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('md-input').value = ev.target.result;
    render();
  };
  reader.readAsText(file, 'UTF-8');
  // 重置 input，允许重复导入同一文件
  e.target.value = '';
}

/* ─────────────────────────────────────────────
   初始化
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // 填充默认 CSS
  document.getElementById('css-preview-input').value = DEFAULT_CSS;

  // 事件绑定
  document.getElementById('md-input').addEventListener('input', render);
  document.getElementById('css-preview-input').addEventListener('input', render);
  document.getElementById('file-input').addEventListener('change', handleFileImport);

  // 初始渲染
  render();
});
