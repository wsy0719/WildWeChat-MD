/* ─────────────────────────────────────────────
   clipboard.js
   写入 text/html MIME 类型，写纯文本是 Bug。
   ───────────────────────────────────────────── */

async function copyHtml() {
  const html = document.getElementById('preview').innerHTML;
  if (!html.trim()) {
    showCopyFeedback('内容为空', 'error');
    return;
  }

  const blob = new Blob([html], { type: 'text/html' });

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob })
    ]);
    showCopyFeedback('已复制！', 'success');
  } catch (err) {
    console.error('复制失败:', err);
    showCopyFeedback('复制失败', 'error');
  }
}

function showCopyFeedback(text, type) {
  const btn = document.getElementById('copy-btn');
  const original = btn.textContent;
  const originalStyle = btn.style.background;

  btn.textContent = text;
  btn.style.background = type === 'success' ? '#4caf82' : '#c0392b';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = originalStyle;
    btn.disabled = false;
  }, 1500);
}
