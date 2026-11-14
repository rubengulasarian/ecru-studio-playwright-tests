# ÉCRU Studio — Playwright + TypeScript test automation

![Playwright tests](https://github.com/rubengulasarian/ecru-studio-playwright-tests/actions/workflows/playwright.yml/badge.svg)

End-to-end (UI) and API test suite for the [ÉCRU Studio practice shop](https://ecru-qa.netlify.app) — a training e-commerce site with intentionally planted defects. It automates the manual test checklist and defect catalog from my [manual QA portfolio](https://github.com/rubengulasarian/ecru-studio-qa).

## What is in here

- **Playwright + TypeScript** with the **Page Object Model** and custom **fixtures**
- **State seeding through `localStorage`** instead of clicking through the UI (the site keeps all its data in the browser), so tests are fast and independent
- **Known-defect tests**: every planted bug has a test that asserts the *correct* behaviour and is marked as an expected failure (`test.fail`). When a defect is fixed, the test starts passing and Playwright flags it, so the marker can be removed
- **API tests** (`request` fixture) against the public JSONPlaceholder REST API: status codes, schema, filtering, CRUD
- **GitHub Actions** pipeline: type check, run, upload the HTML report as an artifact (also runs weekly)

## Project structure

```
src/
  pages/        page objects (shop, product, cart, checkout, register, account)
  fixtures.ts   fixtures that provide page objects and localStorage seeding
  data/         products, users and payment test data
  helpers/      money parsing, known-bug marker
tests/
  catalog.spec.ts   search, category and price filters, sorting, wishlist, images
  product.spec.ts   product page, quantity
  cart.spec.ts      cart totals, quantity, promo code, shipping rule
  checkout.spec.ts  form validation, card and wallet payment, order placement
  auth.spec.ts      registration, login, logout, profile, address, saved card
  api.spec.ts       REST API tests (JSONPlaceholder)
docs/
  BUG-CATALOG.md    defect IDs mapped to automated tests
```

## Run it

```bash
npm ci
npx playwright install chromium

npm test                 # everything
npm run test:stable      # only tests for working behaviour (no @known-bug)
npm run test:bugs        # only the known-defect tests
npm run test:ui          # interactive UI mode
npm run report           # open the last HTML report
```

Other environment: `BASE_URL=http://localhost:3000 npm test`.

## How known defects are reported

```ts
test('@known-bug F2 "Clear cart" removes every item', async ({ site, cartPage }) => {
  knownBug('F2', '"Clear cart" removes only the last item');
  await site.seed({ cart: [{ id: 1, qty: 1 }, { id: 3, qty: 1 }] });
  await cartPage.open();
  await cartPage.clearButton.click();
  await expect(cartPage.emptyState).toBeVisible();   // correct behaviour
});
```

The assertion describes what the application *should* do. While the bug exists the test fails and is shown as an **expected failure** with the defect ID in the report annotations. See [docs/BUG-CATALOG.md](docs/BUG-CATALOG.md) for the full mapping.

## Notes

- The ÉCRU site is a static front end with no back end, so the API tests run against [JSONPlaceholder](https://jsonplaceholder.typicode.com). Override with `API_BASE_URL` if needed. As a public shared service it can occasionally rate-limit requests.
- Purely visual defects (layout, contrast, spacing) are not covered here; they would need screenshot comparison (`toHaveScreenshot`) and are listed as a next step.
