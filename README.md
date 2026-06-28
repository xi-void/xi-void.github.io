# Xi-Void Tools

A small collection of single-purpose, retro-terminal web utilities. Everything
is static and runs entirely in the browser — no backend, no accounts, no
tracking. Live at **https://xi-void.github.io**.

## Tools

| Tool | What it does |
| --- | --- |
| Fraktur Forge | Convert text to Unicode Fraktur (blackletter). |
| Glitch Forge | Corrupt text with stacked combining marks ("zalgo"). |
| Transmuter | Render text in many Unicode styles at once. |
| Cipher | ROT13 / Caesar / Base64 / hex / binary encode & decode. |
| Keymaker | Generate passwords and passphrases via Web Crypto. |
| Digest | SHA-256 / SHA-1 / SHA-384 / SHA-512 hashing. |
| Notepad | Auto-saving scratch buffer (localStorage). |
| Countdown | A local timer that flares and beeps at zero. |

Every tool also has a short guide under `/guide/<slug>/`.

## Stack

Static [Jekyll](https://jekyllrb.com), built automatically by GitHub Pages on
push. No JavaScript framework and no third-party runtime dependencies — each
tool is hand-written HTML, CSS and vanilla JS.

### Layout

```
_config.yml          Site config
_layouts/            default → tool / guide page shells
_includes/           head, nav, footer, command palette
_data/               tools.yml + guides.yml (the source of truth for listings)
assets/css/style.css One shared stylesheet (accent colour is a CSS variable)
assets/js/           site.js (palette, theme, service worker) + one file per tool
tools/<slug>/        One folder per tool
guide/<slug>/        One folder per guide
site.webmanifest     PWA manifest
sw.js                Service worker (offline caching)
android/             Separate native Android port (not part of the site build)
```

The home page, command palette, breadcrumbs and guide hub are all generated from
`_data/tools.yml` and `_data/guides.yml`, so listings stay in sync automatically.

## Adding a tool

1. Add an entry to `_data/tools.yml`:

   ```yaml
   - slug: my-tool
     title: My Tool
     sigil: short // tagline
     blurb: One-line description for the menu.
   ```

2. Create `tools/my-tool/index.html` using the `tool` layout:

   ```html
   ---
   layout: tool
   title: My Tool
   sigil: short // tagline
   subtitle: A sentence about what it does.
   description: SEO description.
   script: /assets/js/my-tool.js
   guide: /guide/my-tool/
   ---
   <!-- tool markup here -->
   ```

3. Put the tool's logic in `assets/js/my-tool.js`.
4. (Optional but encouraged) add a matching guide — see below.
5. To make the tool available offline by default, add its URL and script to the
   `CORE` array in `sw.js` and bump `VERSION`.

## Adding a guide

1. Add an entry to `_data/guides.yml` (`slug`, `title`, `desc`).
2. Create `guide/<slug>/index.html` using the `guide` layout, optionally setting
   `tool:` to link back to the related tool.

## Local development

Requires Ruby and Jekyll (`gem install jekyll`).

```sh
jekyll serve     # http://localhost:4000
jekyll build     # output in _site/
```

Note: Digest and Keymaker use the Web Crypto API, which needs a secure context —
they work on `localhost` and over HTTPS, but not from a raw `file://` path.

## License

Source is available on
[GitHub](https://github.com/xi-void/xi-void.github.io).
