---
name: running-the-app
description: Use when asked to run, launch, smoke-test, or screenshot this Expo app, or to verify a change works in the real app — including when login fails with "Failed to fetch" from a local web build.
---

# Running the MWC Expo App

## Fastest verified path: static web export + headless Chrome

```bash
npx expo export --platform web          # bundling gate — catches plugin/import errors
npx serve dist -l 3100                  # serve the export (background it)
```

Drive it with playwright-core against system Chrome (no browser download needed):

```js
// npm i playwright-core (in a scratch dir, not the repo)
const { chromium } = require('playwright-core');
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.goto('http://localhost:3100/login');
// RN-web renders TextInput as <input>: target by placeholder
await page.getByPlaceholder('e.g. MWC-000123').fill('MWC-000004');
await page.getByPlaceholder('••••••••').fill('MemberDemo123!');
await page.getByText('Log in', { exact: true }).last().click();  // .last(): text nodes nest
```

Always `screenshot` and LOOK at it, and collect `console`/`pageerror` events.

## Demo credentials

- Member: `MWC-000004` / `MemberDemo123!` (also shown on the login screen)
- Merchant POS: see `/merchant-login` (staff accounts are backend-seeded)

## Gotcha: backend CORS blocks localhost

The deployed backend (`EXPO_PUBLIC_API_URL` default) does NOT whitelist localhost
origins — any login/API call from a locally served web build fails with
**"Failed to fetch" / net::ERR_FAILED (CORS)**. This is not an app bug. Options:
- UI-only verification locally (screens render; skip network flows)
- Run the backend locally (`..\MWC-Membership-NodeJS`, default CORS allows :4200)
  and set `EXPO_PUBLIC_API_URL=http://localhost:4000/api` before exporting
- Native builds and the deployed web app are unaffected

## Native / dev-client

`npx expo start` (Metro, port 8081) for Expo Go/dev-client on a device.
Registration flows against the deployed backend create REAL member rows — don't
run registration walkthroughs against it; use login/read flows only.

## Known noise

React error #418 (hydration) on `/history` in the web export — FlatList prerender
quirk, self-corrects, native unaffected. Don't chase it.
