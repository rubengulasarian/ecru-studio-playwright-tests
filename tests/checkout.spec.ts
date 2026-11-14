import { test, expect } from '../src/fixtures';
import { knownBug } from '../src/helpers/known-bug';
import { FREE_SHIPPING_FROM, PRODUCT, SHIPPING_FEE } from '../src/data/products';
import { VALID_CARD, VALID_SHIPPING } from '../src/data/users';

const { affordable, aboveFreeShipping } = PRODUCT;

test.describe('Checkout', () => {
  test('the order summary reflects the cart', async ({ site, checkoutPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 2 }] });
    await checkoutPage.open();
    await expect(checkoutPage.summaryValue('Items')).toHaveText('2 pcs');
    await expect(checkoutPage.summaryValue('Subtotal')).toHaveText(`$${affordable.price * 2}`);
    await expect(checkoutPage.payButton).toContainText(`Pay $${affordable.price * 2 + SHIPPING_FEE}`);
  });

  test('"Pay" stays disabled until every required field is filled', async ({ site, checkoutPage }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await checkoutPage.open();
    await expect(checkoutPage.payButton).toBeDisabled();

    await checkoutPage.fillShipping(VALID_SHIPPING);
    await expect(checkoutPage.payButton).toBeDisabled(); // card details are still missing

    await checkoutPage.fillCard(VALID_CARD);
    await expect(checkoutPage.payButton).toBeEnabled();
  });

  test('a customer can pay by card and the cart is emptied', async ({ site, checkoutPage, cartPage, page }) => {
    await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
    await checkoutPage.open();
    await checkoutPage.fillShipping(VALID_SHIPPING);
    await checkoutPage.fillCard(VALID_CARD);
    await checkoutPage.payButton.click();

    await expect(page).toHaveURL(/success/);
    await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
    await expect(page.locator('#order-id')).toHaveText(/Order number: ECRU-\d{6}/);

    await cartPage.open();
    await expect(cartPage.emptyState).toBeVisible();
  });

  for (const wallet of ['apple', 'google'] as const) {
    test(`paying with ${wallet} pay does not require card details`, async ({ site, checkoutPage, page }) => {
      await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
      await checkoutPage.open();
      await checkoutPage.fillShipping(VALID_SHIPPING);
      await expect(checkoutPage.payButton).toBeDisabled();

      await checkoutPage.selectPayment(wallet);
      await expect(checkoutPage.walletNote).toContainText('after placing the order');
      await expect(checkoutPage.payButton).toBeEnabled();

      await checkoutPage.payButton.click();
      await expect(page).toHaveURL(/success/);
    });
  }

  test('shipping fields are prefilled from the saved profile', async ({ site, checkoutPage }) => {
    await site.seed({
      cart: [{ id: affordable.id, qty: 1 }],
      profile: {
        name: VALID_SHIPPING.name,
        email: VALID_SHIPPING.email,
        phone: VALID_SHIPPING.phone,
        country: VALID_SHIPPING.country,
        city: VALID_SHIPPING.city,
        street: VALID_SHIPPING.street,
        zip: VALID_SHIPPING.zip,
        card: { number: VALID_CARD.number, exp: VALID_CARD.expiry },
      },
    });
    await checkoutPage.open();
    await expect(checkoutPage.name).toHaveValue(VALID_SHIPPING.name);
    await expect(checkoutPage.email).toHaveValue(VALID_SHIPPING.email);
    await expect(checkoutPage.country).toHaveValue(VALID_SHIPPING.country);
    await expect(checkoutPage.city).toHaveValue(VALID_SHIPPING.city);
    await expect(checkoutPage.cardNumber).toHaveValue(VALID_CARD.number);
    await expect(checkoutPage.cardExpiry).toHaveValue(VALID_CARD.expiry);
  });

  test.describe('known defects', () => {
    test.beforeEach(async ({ site, checkoutPage }) => {
      await site.seed({ cart: [{ id: affordable.id, qty: 1 }] });
      await checkoutPage.open();
    });

    test('@known-bug H1 an email without "@" is rejected', async ({ checkoutPage }) => {
      knownBug('H1', 'the email field is only checked for emptiness, not for format');
      await checkoutPage.fillShipping({ ...VALID_SHIPPING, email: 'not-an-email' });
      await checkoutPage.fillCard(VALID_CARD);
      await expect(checkoutPage.payButton).toBeDisabled();
    });

    test('@known-bug H1 a phone number with letters is rejected', async ({ checkoutPage }) => {
      knownBug('H1', 'the phone field accepts letters');
      await checkoutPage.fillShipping({ ...VALID_SHIPPING, phone: 'abc-call-me' });
      await checkoutPage.fillCard(VALID_CARD);
      await expect(checkoutPage.payButton).toBeDisabled();
    });

    test('@known-bug L8 a card number with letters is rejected', async ({ checkoutPage }) => {
      knownBug('L8', 'card number format is not validated');
      await checkoutPage.fillShipping(VALID_SHIPPING);
      await checkoutPage.fillCard({ ...VALID_CARD, number: 'abcd efgh ijkl mnop' });
      await expect(checkoutPage.payButton).toBeDisabled();
    });

    test('@known-bug L8 an expired card is rejected', async ({ checkoutPage }) => {
      knownBug('L8', 'card expiry date is not validated');
      await checkoutPage.fillShipping(VALID_SHIPPING);
      await checkoutPage.fillCard({ ...VALID_CARD, expiry: '01/20' });
      await expect(checkoutPage.payButton).toBeDisabled();
    });

    test('@known-bug H3 switching from a wallet back to "Card" re-validates the card fields', async ({ checkoutPage }) => {
      knownBug('H3', 'after Wallet → Card the Pay button stays enabled with empty card fields');
      await checkoutPage.fillShipping(VALID_SHIPPING);
      await checkoutPage.selectPayment('apple');
      await expect(checkoutPage.payButton).toBeEnabled();
      await checkoutPage.selectPayment('card');
      await expect(checkoutPage.payButton).toBeDisabled();
    });

    test(`@known-bug L3 shipping is free above $${FREE_SHIPPING_FROM} on the checkout page`, async ({ site, checkoutPage }) => {
      knownBug('L3', 'shipping rule is inverted on the checkout page as well');
      await site.seed({ cart: [{ id: aboveFreeShipping.id, qty: 1 }] });
      await checkoutPage.open();
      await expect(checkoutPage.summaryValue('Shipping')).toHaveText('Free');
    });
  });

  test('@known-bug L6 an empty order cannot be paid', async ({ checkoutPage }) => {
    knownBug('L6', 'checkout accepts an empty cart and completes a $0 order');
    await checkoutPage.open(); // nothing in the cart
    await checkoutPage.fillShipping(VALID_SHIPPING);
    await checkoutPage.fillCard(VALID_CARD);
    await expect(checkoutPage.payButton).toBeDisabled();
  });
});
