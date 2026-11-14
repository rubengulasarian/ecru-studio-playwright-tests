import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountPage extends BasePage {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'My account' });
  readonly displayName: Locator = this.page.locator('.p-name');
  readonly displayEmail: Locator = this.page.locator('.p-email');
  readonly fullName: Locator = this.page.locator('#f-name');
  readonly emailField: Locator = this.page.locator('#f-email');
  readonly phone: Locator = this.page.locator('#f-phone');
  readonly saveProfileButton: Locator = this.page.locator('#save-profile');
  readonly profileToast: Locator = this.page.locator('#toast-profile');
  readonly country: Locator = this.page.locator('#f-country');
  readonly city: Locator = this.page.locator('#f-city');
  readonly street: Locator = this.page.locator('#f-street');
  readonly zip: Locator = this.page.locator('#f-zip');
  readonly saveAddressButton: Locator = this.page.locator('#save-address');
  readonly addressToast: Locator = this.page.locator('#toast-address');
  readonly cardNumber: Locator = this.page.locator('#f-card');
  readonly cardExpiry: Locator = this.page.locator('#f-exp');
  readonly saveCardButton: Locator = this.page.locator('#save-card');
  readonly cardToast: Locator = this.page.locator('#toast-card');
  readonly savedCardBrand: Locator = this.page.locator('.card-brand');
  readonly savedCard: Locator = this.page.locator('.card-chip');
  readonly logoutButton: Locator = this.page.locator('#logout');

  async open(): Promise<void> {
    await this.page.goto('/account.html');
  }
}
