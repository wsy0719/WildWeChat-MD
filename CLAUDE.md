# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WildWeChat MD（狂野排版机）** is a pure frontend, zero-backend tool for converting Markdown to WeChat Official Account (公众号)-ready rich text. The core pipeline: paste Markdown → parse to HTML → inject inline CSS → copy `text/html` to clipboard → paste into WeChat editor.

Core philosophy: **Serverless, Zero-UI, CSS in Control.**

## Development

**Run locally:**
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in Chrome. The app also works via `file://` (double-click `index.html`), but the HTTP server is preferred for testing.

## Architecture

Single-page application with no build step, no backend, no cloud dependency. All logic runs in the browser.

### Technology Choices

| Module | Choice | Reason |
| --- | --- | --- |
| Framework | None (Vanilla JS) | Zero dependency, no build step |
| MD parsing | `marked.js` (CDN) | GFM support (tables, code blocks), doesn't strip HTML comments |
| CSS inlining | `juice/client.js` (CDN) | Browser-only build, no Node.js required |
| Clipboard | Clipboard API (native) | Supports `text/html` MIME type required by WeChat |

**CDN scripts (loaded in this order in index.html):**
```html
<script src="https://unpkg.com/marked/marked.min.js"></script>
<script src="https://unpkg.com/juice/client.js"></script>
<script src="js/clipboard.js"></script>
<script src="js/app.js"></script>  <!-- last; initializes on DOMContentLoaded -->
```

### Why No `custom.css` File

`fetch('custom.css')` is blocked by CORS when opened via `file://`. CSS is stored as a `DEFAULT_CSS` string constant in `js/app.js` and used as the initial value of the CSS tab textarea. This naturally enables P1 (CSS hot-reload) without extra architecture.

### Data Flow

```
<textarea id="md-input"> (raw MD)
  → marked.parse(md, { gfm: true }) → raw HTML string
  → juice.inlineContent(html, cssText) → HTML with all styles inlined
  → <div id="preview"> (live preview, right pane)
  → [Copy button] → navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
```

### File Structure

```
index.html         # page entry: layout skeleton + CDN script tags
js/
  app.js           # core pipeline + DEFAULT_CSS string constant
  clipboard.js     # Clipboard API: writes text/html MIME type
docs/
  mvp-prd.md
  tech-spec.md
```

### Layout (index.html)

- Fixed top bar: app name + 【一键复制微信排版】button
- Two-column body (flexbox, `height: 100vh`):
  - Left (50%): Tab switcher
    - Tab 1 「Markdown」: `<textarea id="md-input">`
    - Tab 2 「样式 CSS」: `<textarea id="css-input">`
  - Right (50%): `<div id="preview">`, `overflow-y: scroll`

## Hard Constraints

1. **No image upload / proxy** — broken image URLs are the author's problem
2. **No persistence** — no localStorage, no accounts, no cloud; refresh resets everything
3. **No pseudo-elements or external fonts in CSS** — `::before`, `::after`, `@import url()` are stripped by WeChat's parser; never use them in `DEFAULT_CSS`
4. **Clipboard MIME type must be `text/html`** — writing `text/plain` is a bug; WeChat requires rich text

## DEFAULT_CSS Requirements

`DEFAULT_CSS` in `js/app.js` must cover: `h1`–`h4`, `p`, `strong`, `em`, inline `code`, `pre`, `pre code`, `blockquote`, `table`, `th`/`td`, `img`. Must not use `::before`, `::after`, or `@import url()`.
