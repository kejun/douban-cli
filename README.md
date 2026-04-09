# douban-cli

A cookie-based Douban CLI.

## Install

```bash
npm install
npm link
```

## Login

```bash
douban login
```

Or import existing cookies:

```bash
douban login --import-cookie /path/to/cookies.json
```

## Commands

```bash
douban search "奥本海默"
douban search "三体" --type book
douban info tt1570728
douban rate tt1570728 5
douban wish "三体" --type book
douban me   # markdown profile summary
douban logout
```

## Session and cache

- Session file: `~/.douban/session.json`
- Cache file: `~/.douban/cache.json`
- Disable random delay: `DOUBAN_DELAY=off`
- Override config dir: `DOUBAN_CONFIG_DIR=/custom/path`

## Risk and limitations

- Search now scrapes Douban search pages because the old JSON search endpoint is gone.
- Internal endpoints may change or fail at any time.
- Captcha/403 risk control can block requests; handle in browser and retry.
- Avoid high-frequency actions; cached queries default to 24h.

## Playwright note

If login browser cannot start, install Chromium runtime:

```bash
npx playwright install chromium
```
