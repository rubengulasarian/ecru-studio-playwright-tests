import { test, expect } from '../src/fixtures';
import { knownBug } from '../src/helpers/known-bug';
import { CATALOG_SIZE, CATEGORY_SIZES, PRODUCT } from '../src/data/products';

test.describe('Catalog: browsing, filtering and sorting', () => {
  test.beforeEach(async ({ shopPage }) => {
    await shopPage.open();
  });

  test('lists the whole catalog by default', async ({ shopPage }) => {
    await expect(shopPage.resultCount).toHaveText(`${CATALOG_SIZE} items`);
    await expect(shopPage.cards).toHaveCount(CATALOG_SIZE);
  });

  for (const [category, size] of Object.entries(CATEGORY_SIZES)) {
    test(`category filter shows only "${category}" items`, async ({ shopPage }) => {
      await shopPage.selectCategory(category);
      await expect(shopPage.resultCount).toHaveText(`${size} items`);
      expect(new Set(await shopPage.categories())).toEqual(new Set([category]));
    });
  }

  test('category can be preselected from the URL', async ({ shopPage }) => {
    await shopPage.open('?cat=Jeans');
    await expect(shopPage.category).toHaveValue('Jeans');
    await expect(shopPage.resultCount).toHaveText(`${CATEGORY_SIZES['Jeans']} items`);
  });

  test('sorts by price from low to high', async ({ shopPage }) => {
    await shopPage.selectSort('price-asc');
    const prices = await shopPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts by price from high to low', async ({ shopPage }) => {
    await shopPage.selectSort('price-desc');
    const prices = await shopPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('max price filter includes products priced exactly at the limit', async ({ shopPage }) => {
    const all = await shopPage.prices();
    const limit = PRODUCT.affordable.price;
    await shopPage.setPriceRange({ max: limit });
    await expect(shopPage.cards).toHaveCount(all.filter((price) => price <= limit).length);
    expect(Math.max(...(await shopPage.prices()))).toBe(limit);
  });

  test('search finds products by name', async ({ shopPage }) => {
    await shopPage.searchFor('Linen');
    await expect(shopPage.cards.first()).toBeVisible();
    for (const name of await shopPage.names()) expect(name).toContain('Linen');
  });

  test('search with no matches shows an empty state', async ({ shopPage }) => {
    await shopPage.searchFor('zzzz-no-such-product');
    await expect(shopPage.cards).toHaveCount(0);
    await expect(shopPage.resultCount).toHaveText('0 items');
    await expect(shopPage.emptyMessage).toBeVisible();
  });

  test('discounted products show a Sale tag and the old price', async ({ shopPage }) => {
    const card = shopPage.card(PRODUCT.onSale.id);
    await expect(card.locator('.tag-sale')).toHaveText('Sale');
    await expect(card.locator('.price-old')).toBeVisible();
  });

  test('"Add to cart" gives feedback on the button', async ({ shopPage }) => {
    await shopPage.addToCart(PRODUCT.affordable.id);
    await expect(shopPage.addButton(PRODUCT.affordable.id)).toHaveText('Added ✓');
  });

  test.describe('known defects', () => {
    test('@known-bug F3 search is case-insensitive', async ({ shopPage }) => {
      knownBug('F3', 'search is case-sensitive and returns nothing for "linen"');
      await shopPage.searchFor('linen');
      await expect(shopPage.cards.first()).toBeVisible();
    });

    test('@known-bug H5 min price filter includes products priced exactly at the limit', async ({ shopPage }) => {
      knownBug('H5', 'min price is exclusive (> instead of >=), unlike max price');
      const all = await shopPage.prices();
      const limit = PRODUCT.affordable.price;
      await shopPage.setPriceRange({ min: limit });
      await expect(shopPage.cards).toHaveCount(all.filter((price) => price >= limit).length);
    });

    test('@known-bug F4 price range survives a category change', async ({ shopPage }) => {
      knownBug('F4', 'changing the category clears the min/max price fields');
      await shopPage.setPriceRange({ min: 50 });
      await shopPage.selectCategory('Shirts');
      await expect(shopPage.priceMin).toHaveValue('50');
    });

    test('@known-bug F5 wishlist selection persists after a page reload', async ({ shopPage, page }) => {
      knownBug('F5', 'wishlist lives in memory only and is lost on reload');
      await shopPage.wishButton(PRODUCT.affordable.id).click();
      await expect(shopPage.wishButton(PRODUCT.affordable.id)).toHaveClass(/\bon\b/);
      await page.reload();
      await expect(shopPage.wishButton(PRODUCT.affordable.id)).toHaveClass(/\bon\b/);
    });

    test('@known-bug V3 every product image has alternative text', async ({ shopPage }) => {
      knownBug('V3', 'image of the first Trousers item is missing and has no alt attribute');
      await expect(shopPage.productImage(PRODUCT.brokenImage.id)).toHaveAttribute('alt', /\S/);
    });
  });
});
