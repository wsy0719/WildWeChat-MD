# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WildWeChat MD（狂野排版机）** is a pure frontend, zero-backend tool for converting Markdown to WeChat Official Account (公众号)-ready rich text. The core pipeline: paste Markdown → parse to HTML → inject inline CSS → copy `text/html` to clipboard → paste into WeChat editor.

Core philosophy: **Serverless, Zero-UI, CSS in Control.**

## Architecture

This is a single-page application with no build step, no backend, and no cloud dependency. All logic runs in the browser.

### Key Technical Decisions

- **No framework** (vanilla HTML/CSS/JS) — keeps it truly zero-dependency on infrastructure
- **`marked.js`** for Markdown parsing — must support GFM (tables, code blocks) and must NOT strip HTML comments
- **`juice`** for CSS-to-inline-style conversion — reads `custom.css` and converts all class/tag rules to `style="..."` attributes on each element
- **Clipboard API** with `text/html` MIME type — writing plain text is a bug; WeChat requires rich text

### Data Flow

```
<textarea> (raw MD)
  → marked.js → raw HTML string
  → juice(html, cssText) → HTML with all styles inlined
  → <div id="preview"> (live preview, right pane)
  → [Copy button] → navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
```

### Planned File Structure

```
index.html         # single-page app entry, two-column layout
custom.css         # user-owned CSS; juice reads this to inject inline styles
js/
  app.js           # core pipeline: input → marked → juice → preview
  clipboard.js     # Clipboard API: writes text/html MIME type
docs/
  mvp-prd.md
```

## Hard Constraints (from PRD)

Do not add or suggest features that cross these lines:

1. **No image upload / proxy** — broken image URLs are the author's problem at write-time
2. **No persistence** — no localStorage, no accounts, no cloud; refresh resets everything
3. **No pseudo-elements or external fonts in CSS** — `::before`, `::after`, `@import url()` are stripped by WeChat's parser; never use them in `custom.css`

## P1 Feature (CSS Hot-Reload Tab)

A second tab on the left pane exposes the raw CSS in a `<textarea>`. Edits instantly re-run juice and update the preview. Do not design the core pipeline in a way that prevents adding this later.
