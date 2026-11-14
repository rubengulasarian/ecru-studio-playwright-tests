import { test, expect } from '../src/fixtures';
import { knownBug } from '../src/helpers/known-bug';
import { FREE_SHIPPING_FROM, PRODUCT } from '../src/data/products';

test.describe('Product page', () => {
  test('shows the name, category and price of a product', async ({ productPage }) => {
    await productPage.open(PRODUCT.affordable.id);
    await expect(productPage.title).toContainText('Linen Shirt');
    await expect(productPage.price).toContainText(`$${PRODUCT.affordable.price}`);
    await expect(productPage.categoryLabel).toHaveText(PRODUCT.affordable.category);
  });

  test('explains the free shipping rule', async ({ productPage }) => {
    await productPage.open(PRODUCT.affordable.id);
    await expect(productPage.shippingNote).toContainText(`$${FREE_SHIPPING_FROM}`);
  });

  test('line total follows the selected quantity', async ({ productPage }) => {
    await productPage.open(PRODUCT.affordable.id);
    await productPage.increase.click();
    await expect(productPage.quantity).toHaveValue('2');
    await expect(productPage.lineTotal).toHaveText(`$${PRODUCT.affordable.price * 2}`);
  });

  test('shows a friendly message for an unknown product', async ({ productPage }) => {
    await productPage.open(99999);
    await expect(productPage.notFound).toBeVisible();
  });

  test('adding to cart opens the cart with the product in it', async ({ productPage, cartPage, page }) => {
    await productPage.open(PRODUCT.affordable.id);
    await productPage.addToCartButton.click();
    await expect(page).toHaveURL(/cart/);
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.lineTotal(PRODUCT.affordable.id)).toHaveText(`$${PRODUCT.affordable.price}`);
  });

  test.describe('known defects', () => {
    test('@known-bug F6 quantity cannot drop below 1', async ({ productPage }) => {
      knownBug('F6', 'the "−" stepper allows 0 and negative quantities');
      await productPage.open(PRODUCT.affordable.id);
      await productPage.decrease.click();
      await expect(productPage.quantity).toHaveValue('1');
    });

    test('@known-bug H4 clearing the quantity never shows $NaN', async ({ productPage }) => {
      knownBug('H4', 'an empty quantity field makes the line total render "$NaN"');
      await productPage.open(PRODUCT.affordable.id);
      await productPage.quantity.fill('');
      await expect(productPage.lineTotal).not.toContainText('NaN');
    });
  });
});
