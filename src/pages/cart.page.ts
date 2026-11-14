import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { parseMoney } from '../helpers/money';

export class CartPage extends BasePage {
  readonly rows: Locator = this.page.locator('.cart-item');
  readonly emptyState: Locator = this.page.getByRole('heading', { name: 'Your bag is empty' });
  readonly browseShopLink: Locator = this.page.getByRole('link', { name: 'Browse the shop' });
  readonly clearButton: Locator = this.page.locator('#clear');
  readonly promoInput: Locator = this.page.locator('#promo');
  readonly applyPromoButton: Locator = this.page.locator('#apply-promo');
  readonly promoMessage: Locator = this.page.locator('#promo-msg');
  readonly checkoutLink: Locator = this.page.getByRole('link', { name: 'Checkout' });

  async open(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  row(id: number): Locator {
    return this.rows.filter({ has: this.page.locator(`[data-qty="${id}"]`) });
  }

  quantity(id: number): Locator {
    return this.page.locator(`input[data-qty="${id}"]`);
  }

  lineTotal(id: number): Locator {
    return this.row(id).locator('.ci-line');
  }

  increase(id: number): Promise<void> {
    return this.page.locator(`[data-inc="${id}"]`).click();
  }

  decrease(id: number): Promise<void> {
    return this.page.locator(`[data-dec="${id}"]`).click();
  }

  remove(id: number): Promise<void> {
    return this.page.locator(`[data-remove="${id}"]`).click();
  }

  async setQuantity(id: number, value: number): Promise<void> {
    const input = this.quantity(id);
    await input.fill(String(value));
    await input.blur(); // the cart listens to the "change" event
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
  }

  summaryRow(label: string): Locator {
    return this.page.locator('.summary-row', { hasText: label });
  }

  summaryValue(label: string): Locator {
    return this.summaryRow(label).locator('span').last();
  }

  async total(): Promise<number> {
    return parseMoney(await this.summaryValue('Total').innerText());
  }
}
