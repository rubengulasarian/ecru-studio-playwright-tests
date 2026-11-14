import { test, expect } from '../src/fixtures';
import { knownBug } from '../src/helpers/known-bug';
import { parseMoney } from '../src/helpers/money';
import { FREE_SHIPPING_FROM, PRODUCT, PROMO_CODE, SHIPPING_FEE } from '../src/data/products';

const { affordable, aboveFreeShipping } = PRODUCT;

test.describe('Cart', () => {
  test('an empty cart shows an empty state with a link to the shop', async ({ cartPage }) => {
    await cartPage.open();
    await expect(cartPage.emptyState).toBeVisible();
    await expect(cartPage.browseShopLink).toBeVisible();
  });

  test('shows the items that were added', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 2 }] });
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.quantity(affordable.id)).toHaveValue('2');
    await expect(cartPage.lineTotal(affordable.id)).toHaveText(`$${affordable.price * 2}`);
    await expect(cartPage.summaryValue('Items')).toHaveText(`$${affordable.price * 2}`);
  });

  test('"+" and "−" change the quantity and the totals', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 2 }] });
    await cartPage.open();
    await cartPage.increase(affordable.id);
    await expect(cartPage.quantity(affordable.id)).toHaveValue('3');
    await expect(cartPage.lineTotal(affordable.id)).toHaveText(`$${affordable.price * 3}`);
    await cartPage.decrease(affordable.id);
    await cartPage.decrease(affordable.id);
    await expect(cartPage.lineTotal(affordable.id)).toHaveText(`$${affordable.price}`);
  });

  test('a quantity typed into the field is applied', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await cartPage.open();
    await cartPage.setQuantity(affordable.id, 5);
    await expect(cartPage.lineTotal(affordable.id)).toHaveText(`$${affordable.price * 5}`);
  });

  test('"Remove" deletes only that item', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }, { id: aboveFreeShipping.id, qty: 1 }] });
    await cartPage.open();
    await cartPage.remove(affordable.id);
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.row(aboveFreeShipping.id)).toBeVisible();
  });

  test('removing the last item shows the empty state', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await cartPage.open();
    await cartPage.remove(affordable.id);
    await expect(cartPage.emptyState).toBeVisible();
  });

  test('the cart badge shows the item count after navigating', async ({ site, shopPage, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 3 }] });
    await shopPage.open();
    await expect(shopPage.cartBadge).toHaveText('3');
    await cartPage.open();
    await expect(cartPage.cartBadge).toHaveText('3');
  });

  test(`promo code ${PROMO_CODE} gives a 10% discount`, async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 3 }] }); // $201
    await cartPage.open();
    await cartPage.applyPromo(PROMO_CODE);
    await expect(cartPage.summaryRow('Discount')).toContainText('10%');
    expect(parseMoney(await cartPage.summaryValue('Discount').innerText())).toBe(-20);
  });

  test('promo codes are case-insensitive', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await cartPage.open();
    await cartPage.applyPromo(PROMO_CODE.toLowerCase());
    await expect(cartPage.summaryRow('Discount')).toContainText('10%');
  });

  test('an invalid promo code is rejected', async ({ site, cartPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await cartPage.open();
    await cartPage.applyPromo('NOT-A-CODE');
    await expect(cartPage.promoMessage).toHaveText('That promo code is not valid');
    await expect(cartPage.summaryRow('Discount')).toHaveCount(0);
  });

  test('"Checkout" leads to the checkout page', async ({ site, cartPage, page }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await cartPage.open();
    await cartPage.checkoutLink.click();
    await expect(page).toHaveURL(/checkout/);
  });

  test.describe('known defects', () => {
    test('@known-bug F1 the cart badge updates right after "Add to cart"', async ({ shopPage }) => {
      knownBug('F1', 'header counter is read once on load and not refreshed after adding an item');
      await shopPage.open();
      await shopPage.addToCart(affordable.id);
      await expect(shopPage.cartBadge).toHaveText('1');
    });

    test('@known-bug F2 "Clear cart" removes every item', async ({ site, cartPage }) => {
      knownBug('F2', '"Clear cart" removes only the last item');
      await site.seed({ cart: [{ id: affordable.id, qty: 1 }, { id: aboveFreeShipping.id, qty: 1 }] });
      await cartPage.open();
      await cartPage.clearButton.click();
      await expect(cartPage.emptyState).toBeVisible();
    });

    test('@known-bug L1 a negative quantity never produces a negative total', async ({ site, cartPage }) => {
      knownBug('L1', 'negative quantities are accepted and produce negative line totals and order total');
      await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
      await cartPage.open();
      await cartPage.setQuantity(affordable.id, -2);
      await expect.poll(() => cartPage.total()).toBeGreaterThanOrEqual(0);
    });

    test('@known-bug X1 the "Promo applied" confirmation stays visible', async ({ site, cartPage }) => {
      knownBug('X1', 'found during automation (not in the original catalog): the cart re-renders and wipes the success message at once');
      await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
      await cartPage.open();
      await cartPage.applyPromo(PROMO_CODE);
      await expect(cartPage.promoMessage).toHaveText('Promo applied: −10%');
    });

    test('@known-bug L2 a promo code can be applied only once', async ({ site, cartPage }) => {
      knownBug('L2', 'applying SALE10 repeatedly stacks the discount (10% → 20% → ...)');
      await site.seed({ cart: [{ id: affordable.id, qty: 3 }] });
      await cartPage.open();
      await cartPage.applyPromo(PROMO_CODE);
      await cartPage.applyPromo(PROMO_CODE);
      await expect(cartPage.summaryRow('Discount')).toContainText('10%');
    });

    test(`@known-bug L3 orders above $${FREE_SHIPPING_FROM} ship for free`, async ({ site, cartPage }) => {
      knownBug('L3', 'shipping rule is inverted: the fee is charged ABOVE the free-shipping threshold');
      await site.seed({ cart: [{ id: aboveFreeShipping.id, qty: 1 }] }); // $82
      await cartPage.open();
      await expect(cartPage.summaryValue('Shipping')).toHaveText('Free');
    });

    test(`@known-bug L3 orders up to $${FREE_SHIPPING_FROM} pay the $${SHIPPING_FEE} shipping fee`, async ({ site, cartPage }) => {
      knownBug('L3', 'shipping rule is inverted: small orders ship for free');
      await site.seed({ cart: [{ id: affordable.id, qty: 1 }] }); // $67
      await cartPage.open();
      await expect(cartPage.summaryValue('Shipping')).toHaveText(`$${SHIPPING_FEE}`);
    });
  });
});
