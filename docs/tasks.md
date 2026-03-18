# WildWeChat MD — MVP 开发任务清单

> 参考文档：[mvp-prd.md](mvp-prd.md) · [tech-spec.md](tech-spec.md)
> 规则：每完成一项，将 `[ ]` 改为 `[x]`。

---

## 阶段一：index.html 布局骨架

**目标文件：** `index.html`


- [ ] **1.2** 顶部固定栏：显示工具名「狂野排版机」+ 【一键复制微信排版】按钮（`id="copy-btn"`）
- [ ] **1.3** 主体区域：flexbox 两栏布局，`height: calc(100vh - 顶栏高度)`，左右各 50%
- [ ] **1.4** 左栏：Tab 导航条，含「Markdown」和「样式 CSS」两个 Tab 按钮
- [ ] **1.5** 左栏：`<textarea id="md-input">`，占满左栏剩余高度，无 resize
- [ ] **1.6** 左栏：`<textarea id="css-input">`，初始隐藏（`display: none`），同上尺寸
- [ ] **1.7** 右栏：`<div id="preview">`，`overflow-y: auto`，带左右内边距
- [ ] **1.8** 引入 CDN（顺序：marked → juice，在业务 JS 之前）
  ```html
  <script src="https://unpkg.com/marked/marked.min.js"></script>
  <script src="https://unpkg.com/juice/client.js"></script>
  ```
- [ ] **1.9** 引入本地 JS（顺序：clipboard.js → app.js）

**阶段一验收：** 双击 `index.html` 可正常打开，两栏布局正确，Tab 按钮可见，textarea 可输入。

---

## 阶段二：js/app.js 核心 Pipeline

**目标文件：** `js/app.js`

- [x] **2.1** 创建 `js/app.js`
- [x] **2.2** 定义 `DEFAULT_CSS` 字符串常量，覆盖以下元素（严禁 `::before/::after/@import`）：
  - `h1` ~ `h4`：字号、字重、margin
  - `p`：`line-height: 1.8`、margin
  - `strong`：字重加粗
  - `em`：斜体
  - `code`（行内）：背景色、圆角、等宽字体、padding
  - `pre`：深色背景、padding、`overflow-x: auto`、`border-radius`
  - `pre code`：重置行内 code 样式
  - `blockquote`：左边框 4px、左 padding、字色变灰
  - `table`：`border-collapse: collapse`、宽度 100%
  - `th` / `td`：边框、padding
  - `th`：背景色、字重
  - `img`：`max-width: 100%`、`display: block`
- [x] **2.3** 配置 marked：`marked.use({ gfm: true })`（HTML 注释默认保留，无需额外配置）
- [x] **2.4** 实现 `render()` 函数：
  1. 读 `md-input` 的值
  2. 读 `css-input` 的值
  3. `marked.parse(md)` → 原始 HTML
  4. `juice.inlineContent(rawHtml, css)` → 带 inline style 的 HTML
  5. 写入 `preview.innerHTML`
- [x] **2.5** 实现 `switchTab(tab)` 函数：
  - `tab === 'md'`：显示 `md-input`，隐藏 `css-input`，更新 Tab 按钮 active 状态
  - `tab === 'css'`：反之
- [x] **2.6** `DOMContentLoaded` 初始化：
  - 将 `DEFAULT_CSS` 填入 `css-input.value`
  - `md-input` 绑定 `oninput → render`
  - `css-input` 绑定 `oninput → render`
  - Tab 按钮绑定 `onclick → switchTab`
  - 调用 `render()` 执行初始渲染

**阶段二验收：** 在左侧粘贴 Markdown，右侧实时出现带样式的预览；切换到 CSS Tab 修改样式，右侧立即更新。

---

## 阶段三：js/clipboard.js 剪贴板输出

**目标文件：** `js/clipboard.js`

- [ ] **3.1** 创建 `js/clipboard.js`
- [ ] **3.2** 实现 `copyHtml()` 函数：
  - 读取 `preview.innerHTML`
  - 构造 `new Blob([html], { type: 'text/html' })`
  - 调用 `navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])`
- [ ] **3.3** 成功后：按钮文字短暂变为「已复制！」，1.5s 后恢复原文
- [ ] **3.4** 失败后：按钮文字变为「复制失败」，`console.error` 输出错误信息
- [ ] **3.5** 在 `index.html` 的复制按钮上绑定 `onclick="copyHtml()"`

**阶段三验收：** 点击复制 → 打开微信公众号编辑器 → `Ctrl+V` → 粘贴结果为富文本（有样式），而非裸文字。

---

## 最终约束检查（上线前逐条确认）

- [ ] **C1** 剪贴板写入的 MIME 类型是 `text/html`，不是 `text/plain`
- [ ] **C2** `DEFAULT_CSS` 中无 `::before`、`::after`、`@import url()`
- [ ] **C3** 代码中无 `localStorage`、`sessionStorage`、`cookie` 操作
- [ ] **C4** 代码中无图片上传、代理、Base64 转换逻辑
- [ ] **C5** 代码中无任何 `fetch` 到业务服务器的请求
- [ ] **C6** 以 `file://` 协议直接打开 `index.html` 功能完整，无报错

---

## 快速测试用 Markdown 样本

完成后用以下内容做端到端验证：

```markdown
# 一级标题

## 二级标题

这是一段普通文字，包含**加粗**和*斜体*内容。

> 这是一段引用文字，用于测试 blockquote 样式。

行内代码：`console.log('hello')`

代码块：

\`\`\`javascript
function greet(name) {
  return `Hello, ${name}!`;
}
\`\`\`

| 列一 | 列二 | 列三 |
| --- | --- | --- |
| A | B | C |
| D | E | F |
```
