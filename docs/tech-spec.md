# 技术方案文档：WildWeChat MD（狂野排版机）MVP

## 1. 项目定位

纯前端、零后端、零构建步骤的 Markdown → 微信公众号富文本转换工具。双击 `index.html` 即可使用，无需服务器，无需安装任何依赖。

---

## 2. 技术选型

| 模块 | 方案 | 理由 |
| --- | --- | --- |
| 框架 | 无（Vanilla JS） | 零依赖，无构建，符合"Serverless"理念 |
| MD 解析 | marked.js（CDN） | 成熟库，支持 GFM（表格、代码块），不过滤 HTML 注释 |
| CSS 内联 | juice/client.js（CDN） | juice 的浏览器专用 build，无 Node.js 依赖 |
| 剪贴板 | Clipboard API（原生） | 支持 `text/html` MIME 类型，微信公众号需要富文本 |
| 运行环境 | `file://` 协议 | 无需本地服务器，双击即用 |

### CDN 引入

```html
<script src="https://unpkg.com/marked/marked.min.js"></script>
<script src="https://unpkg.com/juice/client.js"></script>
```

---

## 3. 文件结构

```
index.html          # 页面入口：布局骨架 + CDN script 标签
js/
  app.js            # 核心 pipeline + 默认 CSS 字符串常量
  clipboard.js      # Clipboard API 写 text/html
docs/
  mvp-prd.md        # 产品需求文档
  tech-spec.md      # 本文档
```

> **为什么没有 `custom.css` 文件？**
> 以 `file://` 协议打开 HTML 时，`fetch('custom.css')` 会被浏览器 CORS 策略拦截。因此 CSS 以 JS 字符串常量形式内嵌在 `app.js` 中，同时作为左侧 CSS Tab 的初始值。这样 P1（CSS 热更新）无需额外架构，自然实现。

---

## 4. 数据流（Pipeline）

```
用户输入 Markdown
    ↓
<textarea id="md-input">
    ↓  marked.parse(md, { gfm: true })
原始 HTML 字符串
    ↓  juice.inlineContent(html, cssText)
带 inline style 的 HTML
    ↓
<div id="preview">  ←  实时预览（右栏）
    ↓  [点击复制按钮]
navigator.clipboard.write([
  new ClipboardItem({ 'text/html': blob })
])
    ↓
粘贴进微信公众号后台
```

---

## 5. 各文件实现规格

### 5.1 index.html

**布局：**
- 顶部固定栏：工具名称 + 【一键复制微信排版】按钮
- 主体两栏（flexbox，`height: 100vh`）：
  - 左栏（50%）：Tab 切换区 + 对应 textarea
    - Tab 1「Markdown」：`<textarea id="md-input">`
    - Tab 2「样式 CSS」：`<textarea id="css-input">`
  - 右栏（50%）：`<div id="preview">` 渲染区，`overflow-y: scroll`

**script 加载顺序：**
```html
<!-- CDN（先于业务代码） -->
<script src="https://unpkg.com/marked/marked.min.js"></script>
<script src="https://unpkg.com/juice/client.js"></script>
<!-- 业务代码 -->
<script src="js/clipboard.js"></script>
<script src="js/app.js"></script>  <!-- 最后加载，DOMContentLoaded 里初始化 -->
```

---

### 5.2 js/app.js

**`DEFAULT_CSS` 字符串常量规格（微信兼容）：**

覆盖以下元素，禁止使用 `::before`、`::after`、`@import url()`：

| 元素 | 样式要点 |
| --- | --- |
| `h1` ~ `h4` | 字号梯度、字重、上下 margin |
| `p` | `line-height: 1.8`、上下 margin |
| `strong` | 字重加粗、可加颜色强调 |
| `em` | 斜体 |
| `code`（行内） | 背景色、圆角、等宽字体、左右 padding |
| `pre`（代码块） | 深色背景、padding、`overflow-x: auto`、`border-radius` |
| `pre code` | 重置行内 code 样式 |
| `blockquote` | 左边框（4px solid）、左 padding、文字颜色变灰 |
| `table` | `border-collapse: collapse`、宽度 100% |
| `th` / `td` | 边框、padding |
| `th` | 背景色、字重 |
| `img` | `max-width: 100%`、`display: block` |

**核心函数：**

```js
// marked 配置（只需一次）
marked.use({ gfm: true });

// 渲染函数
function render() {
  const md  = document.getElementById('md-input').value;
  const css = document.getElementById('css-input').value;
  const raw = marked.parse(md);
  const inlined = juice.inlineContent(raw, css);
  document.getElementById('preview').innerHTML = inlined;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('css-input').value = DEFAULT_CSS;
  document.getElementById('md-input').addEventListener('input', render);
  document.getElementById('css-input').addEventListener('input', render);
  render(); // 初始渲染（textarea 若有默认内容）
});
```

**Tab 切换：**
```js
function switchTab(tab) {
  // tab: 'md' | 'css'
  // show/hide 两个 textarea，切换 Tab 按钮的 active 状态
}
```

---

### 5.3 js/clipboard.js

```js
async function copyHtml() {
  const html = document.getElementById('preview').innerHTML;
  const blob = new Blob([html], { type: 'text/html' });
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob })
    ]);
    showCopyFeedback('已复制！');
  } catch (err) {
    console.error('复制失败:', err);
    showCopyFeedback('复制失败');
  }
}
```

> **关键约束：** MIME 类型必须是 `text/html`。写入 `text/plain` 是 Bug，粘贴到微信后样式全丢。

---

## 6. 关键约束检查

| 约束 | 实现保障 |
| --- | --- |
| 剪贴板写 `text/html` | `ClipboardItem({ 'text/html': blob })` 硬编码 |
| CSS 无伪元素、无外部字体 | `DEFAULT_CSS` 编写时人工遵守，微信会直接剥离违规属性 |
| 无持久化 | 无 localStorage，无 cookie，刷新即重置 |
| 无图片上传 | 不处理 `<img>` 的 src，裂图由用户自行保证 |
| 无后端请求 | 纯 CDN + file://，无任何 fetch 到业务服务器 |

---

## 7. 验证方案（端到端）

1. 双击 `index.html`，用 Chrome 以 `file://` 协议打开
2. 左侧粘贴含以下元素的 Markdown 样本：
   - `# 标题`、`## 二级标题`
   - 段落、`**加粗**`、`*斜体*`
   - `\`行内代码\``、代码块（含语言标注）
   - `> 引用`
   - 表格（GFM 格式）
3. 确认右侧实时渲染正确，样式生效
4. 切换到「样式 CSS」Tab，修改 `h1` 颜色为红色，确认右侧实时变化
5. 点击【一键复制微信排版】
6. 打开微信公众号后台编辑器，`Ctrl+V` 粘贴
7. 验收标准：粘贴结果为**富文本**（标题有样式、代码块有背景色），而非裸文字

---

## 8. 已知限制（MVP 阶段接受）

- 需要联网加载 CDN（marked.js、juice）；离线使用需将这两个文件下载到本地 `vendor/` 目录并修改 script src
- `Clipboard API` 在部分旧浏览器不支持；目标环境为 Chrome 最新版，不做兼容降级
- CSS 热更新 Tab 的内容刷新后丢失（符合"无持久化"约束）
