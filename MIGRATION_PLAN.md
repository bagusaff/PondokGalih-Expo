# PondokGalih POS — React Native → Expo Migration Plan

> **Source:** `C:\Kerjaan\Project\ReactNative-PosApp` (branch `V-113` primary, `V-110-Identitas` for the second build variant)
> **Target:** `C:\Kerjaan\Project\PondokGalih-Expo` — Expo SDK 57, RN 0.86.3, React 19.2, expo-router, TypeScript
> **Status:** PLANNING — no code written yet
> **Last updated:** 2026-08-30

---

## 1. Background

Android tablet (landscape) POS app built on RN 0.70.4 + UI Kitten, written pre-AI with patterns to be modernized. Two production variants exist:

| | Variant A (branded) | Variant B (disguised) |
|---|---|---|
| Source branch | `V-113` | `V-110-Identitas` |
| App name | POS Pondok Galih | Error |
| Icon | Real logo | Default RN icon |
| API base | `http://103.175.218.59/api` | `http://128.199.225.122/api` |
| Feature set | Newer receipt logic (payment method, charge fee, item notes, conditional rounding) | Older receipt logic (always rounding, no charge/notes) |
| History tab | *Reported hidden* (see §8 discrepancy) | Shows everything |

**Non-negotiables:**
1. **Print logic is frozen.** Receipt string generation, formatting (48-char rows, `<L>/<C>` markup), the base64 logo print, and the connect/print call sequences are tested on real thermal printers and must be ported **verbatim**.
2. UI must be **99% visually identical** (layout, spacing, colors) — only the underlying library changes.
3. Both build variants must be producible from one codebase.

---

## 2. Old App Inventory

### 2.1 Dependency map (old → new)

| Old package | Verdict | Replacement in Expo app |
|---|---|---|
| `@ui-kitten/components` + `@eva-design/eva` + eva-icons (32 files) | **Replace** — dormant since ~2023 | Custom component kit + design tokens (§4) |
| `react-native-thermal-receipt-printer-image-qr@0.1.10` | **Keep** (pin `0.1.12`, last publish Sep 2024) | Same lib via prebuild; spike required (§6) |
| `redux` + `redux-thunk` + `react-redux` | **Modernize** | `@reduxjs/toolkit` + `react-redux` (1:1 port of reducer logic) |
| `redux-persist` + `@react-native-async-storage/async-storage` | Keep | Same (RTK-compatible) |
| `@react-navigation/*` (native-stack, material-top-tabs, bottom-tabs*) | Replace | `expo-router` (top-tabs via `withLayoutContext`) — *bottom-tabs is installed but unused* |
| `react-native-size-matters` | Replace (tiny, unmaintained) | Local `src/lib/scaling.ts` reimplementing `scale/verticalScale/moderateScale` (~20 lines, identical math → identical layout) |
| `moment` | **Keep for now** | Receipt/date formats must not drift; optional dayjs swap post-parity |
| `axios@1.2.0-alpha.1` | Upgrade | `axios` latest stable (audit interceptors/error shapes during port) |
| `@react-native-community/netinfo` | Keep | Same (Expo-compatible) |
| `@react-native-picker/picker` | Keep | Same (used in Printer screen) |
| `lottie-react-native` | Keep | Same (splash + finish-order animations) |
| `react-native-linear-gradient` | Replace | `expo-linear-gradient` |
| `@sayem314/react-native-keep-awake` | Replace | `expo-keep-awake` (POS screens must not sleep) |
| `react-native-toast-message` | Keep | Same (pure JS, maintained) |
| `react-native-modal` | Replace | RN core `Modal` + small wrapper (fade/backdrop parity) |
| `react-native-easy-grid` | Replace (dead) | Plain flexbox |
| `react-native-currency-input` | Keep | Same (pay-amount input behavior is tested) |
| `react-native-dotenv` | Replace | `app.config.ts` + `EXPO_PUBLIC_*` / EAS env per variant |
| `react-native-keyboard-aware-scroll-view` | Replace (dead) | `KeyboardAvoidingView` / `react-native-keyboard-controller` if needed |
| `hermes-engine` (manual dep) | Drop | Hermes is built into RN 0.86 |

### 2.2 Screen & component inventory (all must reach visual parity)

**Navigation shell**
- `Root.stack.js` → Splash → PreFetch → Auth(Login) → TopTab / FinishOrder (full-screen)
- `TopTab.js` → material top tabs: **Home | Billing | Order History | Setting** (UI Kitten TabBar, 50px height, h1 20px hint-styled labels)
- `HomeLayout.js` → landscape split: left content `flex 6.5`, right `OrderMenu` sidebar `flex 3.5`, 2px `#F7F9FC` left border

**Screens (10):** Splash, PreFetch, Login, Home (search + SalesType selector + FilterCard categories + MenuCard grid), Billing (open bills + print), History (transactions + reprint), FinishOrder (payment result + print + net-printer reconnect), Setting, Configuration, Printer (type picker BLE/Net/USB, device scan, host/port input, connect, test print)

**Components (24):** cards (Billing, DetailTotalOrder, EmptyBill, EmptyMenu, Filter, Menu, OrderMenu), modals (Bill, Filter, Menu{Header,Body}, Order{OrderModal 677 lines — biggest, EDCButton, PayAmountButton}), sidebar (HistoryMenu, OrderMenu), MenuHeader, SalesType selector, NoConnection alert

**State (12 reducers):** user/auth, menu, category, salestype, order, bill, discount, tax, setting (printer persisted here), connection — persisted via redux-persist

**Print-logic files (frozen, 7):** `OrderModal.js`, `BillModal.js`, `Billing.screen.js`, `History.screen.js`, `finishorder/index.js`, `Home.screen.js` (auto-reconnect on mount), `Printer.screen.js` + helpers (`AdjustPriceText.js` row/divider generators, `utils.js` base64 logo)

---

## 3. Decisions (confirmed with owner, 2026-08-30)

1. **UI:** Custom components + design tokens, plain StyleSheet. No third-party UI kit.
2. **State:** Redux Toolkit, reducers/thunks ported 1:1, redux-persist kept.
3. **History tab:** controlled by **build-time env flag** per variant (see §8 discrepancy).
4. **Package IDs:** different per variant → side-by-side installable.
5. **Language:** TypeScript for new code; print logic ported verbatim (typed loosely — no behavioral edits).

---

## 4. UI Parity Strategy (the 99% rule)

### 4.1 Design tokens — `src/theme/`
- `colors.ts`: port all 45 values of `custom-theme.json` (primary green `#009900` scale, success/info/warning/danger scales) **plus** the Eva light-theme values the app actually consumes: `Layout level 1/2/3` backgrounds (`#FFFFFF`, `#F7F9FC`, `#EDF1F7`), basic text colors, hint color (`#8F9BB3`), border/disabled colors. Extract these from `@eva-design/eva`'s light mapping so rendered colors are identical, not approximated.
- `typography.ts`: Eva text categories used in code (`h1`…`h6`, `s1`, `p1`, `c1`, `label`) → fontSize/weight map copied from Eva defaults, so `<AppText category="h6">` renders identically.
- `scaling.ts`: `scale`, `verticalScale`, `moderateScale` with size-matters' exact formulas (guideline base 350×680).

### 4.2 Custom component kit — `src/components/ui/`
One replacement per UI Kitten primitive actually used, matching Eva's rendered CSS (padding, radius, border, states):

| UI Kitten | Replacement | Parity notes |
|---|---|---|
| `Layout level={n}` | `AppLayout` | maps level → token background |
| `Text category status appearance` | `AppText` | category map + `hint` appearance |
| `Button status appearance size accessoryLeft` | `AppButton` | Eva variants used: `filled/outline/ghost` × `primary/info/danger/basic`; copy exact padding/radius/border from Eva mapping |
| `Input accessoryLeft placeholder` | `AppInput` | 4px radius, `#E4E9F2` border, focus `#009900` |
| `Icon name=` (eva-icons) | `AppIcon` | bundle only the ~15 eva icon SVGs used (search, arrow-back, close, etc.) via `react-native-svg` — keeps identical glyphs |
| `Card` | `AppCard` | |
| `Divider` | `AppDivider` | 1px `#EDF1F7` |
| `Spinner size status` | `AppSpinner` | RN `ActivityIndicator` sized/colored to match |
| `TabBar`/`Tab` | `AppTopTabBar` | 50px height, indicator color, 20px labels |
| `Modal` (rn-modal) | `AppModal` | RN Modal, transparent + fade + backdrop `rgba(0,0,0,0.5)` |
| `CheckBox`/`Radio`/`Toggle` (if found during port) | add on demand | |

**Parity verification loop (per screen):** run old APK on tablet/emulator → screenshot → build same screen in Expo → screenshot at same resolution → overlay compare → fix → check off. Screenshot checklist lives in `docs/PARITY_CHECKLIST.md` (created during Phase 3).

### 4.3 What we intentionally improve (the 1%) — PERFORMANCE CHARTER
**Primary refactor goal (owner, 2026-08-30): fix UI latency — slow add-to-cart taps, slow modal opens.** Root causes in the legacy app: old-architecture bridge, Redux re-render fanout (HomeLayout subscribes to `orderItems`, so every cart change re-renders the whole menu grid), JS-thread `react-native-modal` animations with full content mounted in the opening frame, hot-path `console.log`s, unmemoized FlatList grid.

Commitments for the port (visuals stay identical):
1. **Free wins from the platform**: New Architecture (JSI, no bridge), modern Hermes, React Compiler (enabled in app.json) for auto-memoization.
2. **Narrow selectors**: screens select only the fields they render (`useAppSelector(s => s.order.orderItems.length)` style, `shallowEqual` where needed). The menu grid must NOT re-render when the cart changes — verify with React DevTools highlight during Phase 3.
3. **List virtualization**: `FlatList` + `React.memo` rows with stable callbacks. (Tried `FlashList` on the menu grid — reverted 2026-08-31: v2 flows grid columns independently/masonry-style, staggering variable-height cards and leaving blank holes on category switches. With narrow selectors + memoized cards, FlatList is smooth and row-aligned like legacy.)
4. **Modals**: core RN `Modal` (native fade) via `AppModal`; heavy modal bodies (MenuModal, OrderModal) mount content lazily so the open animation never competes with layout work; any custom transitions run on the UI thread (Reanimated 4).
5. **Images**: `expo-image` with caching for menu photos (placeholder identical to legacy).
6. **No console noise in release**: `babel-plugin-transform-remove-console` for production builds (logs kept in dev).
7. **Persist hygiene**: only user/setting/pendingOrder persisted (as legacy) — no per-keystroke storage writes.

Acceptance targets on the real tablet (Phase 5 regression): add-to-cart tap → sidebar row visible < 100ms; modal open animation starts < 1 frame after tap and runs at 60fps; menu grid scroll with 100+ items has no dropped-frame stutter.
- No layout, spacing, color, or copy changes anywhere.

---

## 5. Navigation Mapping (expo-router)

```
app/
  _layout.tsx            → providers: Redux store, PersistGate, Toast, StatusBar hidden, keep-awake
  index.tsx              → Splash (redirects → prefetch)
  prefetch.tsx           → PreFetchScreen
  (auth)/login.tsx       → Login
  (tabs)/_layout.tsx     → material top tabs via withLayoutContext(createMaterialTopTabNavigator)
  (tabs)/index.tsx       → Home
  (tabs)/billing.tsx     → Billing
  (tabs)/history.tsx     → History   ← omitted from tab bar when HIDE_HISTORY=true
  (tabs)/setting/index.tsx, configuration.tsx, printer.tsx
  finish-order.tsx       → full-screen outside tabs (matches Root.stack)
```
- `@react-navigation/material-top-tabs` + `react-native-pager-view` stay as deps (expo-router wraps them); `swipeEnabled: false` preserved.
- `RootNavigation.js` imperative helper → `router` from expo-router.
- Screen orientation locked landscape (`app.json` → `"orientation": "landscape"` — old app relied on tablet usage; verify old manifest behavior during Phase 1).

---

## 6. Thermal Printing (FROZEN LOGIC)

### 6.1 Library verdict
`react-native-thermal-receipt-printer-image-qr` — last published **Sep 2024 (v0.1.12)**; dormant but alive. **Decision: keep it.** Reasons: the `<L>/<C>` receipt markup and `printBill`/`printImageBase64` APIs are lib-specific — swapping libs would force rewriting tested receipt strings. Works with `expo prebuild`/EAS dev client (never Expo Go).

### 6.2 Phase 0 spike (do this FIRST — go/no-go gate)
1. Add lib to the Expo project, `expo prebuild`, build dev client via EAS (or local `gradlew`).
2. Verify it compiles on RN 0.86 / New Architecture (legacy NativeModules go through the interop layer; EventEmitters in `Printer.screen` are the risk point).
3. Test on the real tablet + thermal printer: BLE scan/connect/print, Net connect/print, sample `<C>` text + base64 logo image.
4. **Fallbacks if it fails to compile:** (a) patch-package/fork with fixed Gradle config; (b) known community forks; (c) last resort — a maintained ESC/POS lib behind a thin adapter that re-implements the exact `<L>/<C>` markup parser so receipt strings stay untouched. Do **not** proceed to Phase 3+ until printing is proven.

### 6.3 Port rules
- Copy the 7 print files' logic verbatim; only mechanical changes allowed: import paths, `useSelector` typing, navigation calls.
- `AdjustPriceText.js` (row/divider generators) and the base64 logo copied byte-for-byte.
- Keep both variants' receipt differences (V-113 has payment-method charge + notes + conditional rounding; Identitas always rounds) — gate with the same variant flag as §8, mirroring each branch's code path exactly.
- **New (required, not a logic change):** Android 12+ runtime permissions `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT` (+ legacy `ACCESS_FINE_LOCATION` for old Android) requested before BLE scan/connect — old app targeted SDK 31-era; Expo 57 targets newer SDK where these prompts are mandatory. Add via `app.json` permissions + a `usePrinterPermissions` hook wrapping (not modifying) the existing connect flows.

---

## 7. State Migration (Redux Toolkit)

- 12 reducers → 12 `createSlice`s; action creators → thunks via `createAsyncThunk` or plain thunks (RTK includes thunk middleware). **Reducer math (order totals, discount, tax, rounding) is near-frozen: port line-by-line, no refactors of formulas.**
- redux-persist config identical (AsyncStorage, same whitelist/keys — check `store.js` for persisted keys, at minimum `setting` for the saved printer and auth token).
- Typed hooks `useAppDispatch`/`useAppSelector`.
- V-113 vs Identitas reducer diffs (Order, SalesType, User) handled with the variant flag, matching each branch exactly.

---

## 8. Build Variants (EAS)

- `app.config.ts` reads `APP_VARIANT` (`branded` | `generic`):

| | `branded` | `generic` |
|---|---|---|
| name | POS Pondok Galih | Error |
| android package | `com.pondokgalih.pos` | `com.posapp.generic` |
| icon | real logo (from `AppIcons/`) | Expo default |
| `EXPO_PUBLIC_API_URL` | `http://103.175.218.59/api` | `http://103.175.218.59/api` (same server — confirmed 2026-08-30) |
| `EXPO_PUBLIC_HIDE_HISTORY` | `true` (confirmed 2026-08-30) | `false` |
| receipt/feature profile | V-113 code paths | V-110-Identitas code paths |

- `eas.json`: profiles `branded-dev`, `branded-prod`, `generic-dev`, `generic-prod` (dev profiles = dev client for printer testing).
- Cleartext HTTP APIs → `expo-build-properties` `usesCleartextTraffic: true` (both variants use `http://`).

> **Resolved (2026-08-30):** owner confirmed the branded "Pondok Galih POS" app (real icon) hides the History tab; the "Error" app (default icon) shows all tabs. No committed branch contains this hiding (all 13 branches render 4 tabs), so the new app implements it cleanly via `EXPO_PUBLIC_HIDE_HISTORY` per the table above. Owner also confirmed **both variants now point at `http://103.175.218.59/api`** — the old Identitas server (`128.199.225.122`) is retired.

---

## 9. Phases & Checklist

**Phase 0 — Printer spike (gate)** ☑ lib compiles on SDK 57 (2026-08-30, `assembleDebug` successful with patched lib; AAR produced) ☐ BLE + Net print verified on real hardware ☐ decision logged here

> Phase 0 log (2026-08-30):
> - Installed `react-native-thermal-receipt-printer-image-qr@0.1.12` (needs `--legacy-peer-deps`, now handled by `.npmrc`).
> - **Correction (Phase 2):** the `react-native-ping` peer dep IS required — `dist/utils/net-connect.js` imports it for net-printer scanning (Metro bundling fails without it). The old app had it via yarn's auto-install of `react-native-ping@*` → 1.2.7. Installed the same version; patched it for AGP 8 (namespace, manifest `package=` removed, dead jcenter/AGP-3.3.2 buildscript block stripped, SDK defaults raised) via `patches/react-native-ping+1.2.7.patch`.
> - Lib predates AGP 8: patched via `patch-package` (postinstall hook added) — added `namespace "com.pinmi.react.printer"` to its build.gradle, compileSdk/minSdk/targetSdk now follow the root project, removed `package=` attr from its AndroidManifest. Patch: `patches/react-native-thermal-receipt-printer-image-qr+0.1.12.patch`.
> - `app.json`: landscape, `com.pondokgalih.pos`, BLE runtime permissions (SCAN/CONNECT/FINE_LOCATION).
> - Spike screen `src/app/printer-spike.tsx` (throwaway) + real logo copied to `src/features/printing/logo.js` — tests init/scan/connect/printBill/printImageBase64 for BLE & Net.
> - ⚠ `.claude/skills/expo-cicd-workflows/scripts/node_modules/onepass-erp` contains a recursive node_modules loop — breaks recursive directory scans; consider deleting/excluding it.

**Phase 1 — Foundation** ☑ deps installed ☑ theme tokens (`src/theme/`: colors from custom-theme.json + Eva 2.1.1 light, typography categories, size-matters scaling math) ☑ UI kit (`src/components/ui/`: AppText, AppLayout, AppButton, AppInput, AppIcon w/ 14 eva glyphs, AppCard, AppDivider, AppSpinner, AppModal) ☑ visual test screen `src/app/ui-kit-preview.tsx` ☑ `app.config.ts` + `eas.json` (4 profiles, verified both variants resolve) ☑ landscape lock ☑ cleartext config (expo-build-properties) — visual parity sign-off pending device screenshots (Phase 3 loop)

**Phase 2 — State & services** ☑ 10 RTK slices ported 1:1 (`src/state/slices/`; cross-slice logout via shared action; menu deliberately survives logout; order keeps `pendingOrder` on logout, both as legacy) ☑ redux-persist parity (root: user+setting, nested: order.pendingOrder) ☑ thunks with legacy names/signatures (`src/state/thunks/`, re-exported from `src/state/index.ts`) ☑ axios client (`src/lib/api.ts`, `EXPO_PUBLIC_API_URL`) ☑ NetInfo watcher ☑ providers wired in `src/app/_layout.tsx` ☑ persisted-printer auto-reconnect hook (`src/features/printing/use-printer-reconnect.ts`, + BLE runtime-permission gate) ☑ bundle check passed (expo export)
> Deviations (documented): `selectedSalesIndex` is a plain number instead of UI Kitten `IndexPath`; `batch()` dropped (React 18 auto-batches); store `serializableCheck` disabled (legacy Dates in bill state); navigation via `src/lib/legacy-navigation.ts` route map.

**Phase 3 — Screens (parity loop per screen)** ☑ ALL screens code-ported (2026-08-30): Splash, PreFetch, Login, tab shell (vendored `expo-router/js-top-tabs` — SDK 56+ forbids direct `@react-navigation/material-top-tabs`), Home (+HomeLayout/OrderMenu/MenuCard/FilterCard/SalesTypeSelect/MenuModal/FilterModal), OrderModal + BillModal + PayAmountButton (print logic verbatim), Billing (+BillingCard/EmptyBill), History (+HistoryMenu), FinishOrder, Setting, Configuration, Printer. tsc + Metro bundle green. ☐ per-screen screenshot parity sign-off on device (pending tablet)
> Port notes: EDCButton and MenuModal/Header+Body were dead legacy code — not ported. `finishedOrder` travels via order slice (expo-router params are string-serialized). IndexPath compat shims where legacy persisted `sales_index` objects (BillingCard reads `.row ?? number`). Perf charter applied: lazy modal mounting (legacy mounted one MenuModal per menu card!), FlashList menu grid, narrow selectors so cart changes don't re-render the grid, HomeLayout no longer subscribes to orderItems.

**Phase 4 — Print integration** ☐ 7 files ported verbatim ☐ permissions hook ☐ real-hardware receipt test for every print path (order, bill, reprint from history, finish-order, sample) comparing paper output against old app's receipts

**Phase 5 — Variants & release** ☐ both variants build ☐ variant feature/receipt paths verified ☐ branded build hides History tab / generic shows it ☐ side-by-side install test ☐ full POS regression on tablet (login → order → pay → print → history reprint)

**Skills to use during implementation** (per project rule): `building-native-ui` / `expo-native-ui` for screens, `animate-expo` for any motion, `superink-ux:ux-states` for state coverage, `running-the-app` for launch/verification, `code-review` before merges.

---

## 10. Risks

| Risk | Level | Mitigation |
|---|---|---|
| Printer lib fails on New Architecture | **High** | Phase 0 gate + fallback ladder (§6.2) |
| Eva color/typography approximation drift | Med | Extract real values from Eva source, screenshot overlays |
| BLE runtime permissions change UX flow | Med | Permission hook wraps old flow; test on Android 12+ tablet |
| axios alpha → stable behavior differences | Low-Med | Audit response/error handling during Phase 2 |
| React 19 + old patterns (defaultProps, etc.) | Low | Custom UI kit avoids legacy libs entirely |
| History-tab discrepancy | Resolved | Env flag; branded hides, generic shows (§8) |
