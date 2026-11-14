import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { CardDetails, ShippingDetails } from '../data/users';

export type PaymentMethod = 'card' | 'apple' | 'google';

export class CheckoutPage extends BasePage {
  readonly name: Locator = this.page.locator('#c-name');
  readonly email: Locator = this.page.locator('#c-email');
  readonly phone: Locator = this.page.locator('#c-phone');
  readonly country: Locator = this.page.locator('#c-country');
  readonly city: Locator = this.page.locator('#c-city');
  readonly street: Locator = this.page.locator('#c-street');
  readonly zip: Locator = this.page.locator('#c-zip');
  readonly cardNumber: Locator = this.page.locator('#p-card');
  readonly cardExpiry: Locator = this.page.locator('#p-exp');
  readonly cardCvc: Locator = this.page.locator('#p-cvc');
  readonly walletNote: Locator = this.page.locator('#wallet-note');
  readonly payButton: Locator = this.page.locator('#pay');

  async open(): Promise<void> {
    await this.page.goto('/checkout.html');
  }

  async fillShipping(details: ShippingDetails): Promise<void> {
    await this.name.fill(details.name);
    await this.email.fill(details.email);
    await this.phone.fill(details.phone);
    await this.country.selectOption(details.country);
    await this.city.fill(details.city);
    await this.street.fill(details.street);
    await this.zip.fill(details.zip);
  }

  async fillCard(card: CardDetails): Promise<void> {
    await this.cardNumber.fill(card.number);
    await this.cardExpiry.fill(card.expiry);
    await this.cardCvc.fill(card.cvc);
  }

  selectPayment(method: PaymentMethod): Promise<void> {
    return this.page.locator(`.pay-method[data-method="${method}"]`).click();
  }

  summaryRow(label: string): Locator {
    return this.page.locator('#summary .summary-row', { hasText: label });
  }

  summaryValue(label: string): Locator {
    return this.summaryRow(label).locator('span').last();
  }
}
