import type { Locator, Page } from '@playwright/test';

/** Elements shared by every page: the header with the account link and the cart badge. */
export abstract class BasePage {
  readonly cartBadge: Locator;
  readonly accountLink: Locator;

  constructor(protected readonly page: Page) {
    this.cartBadge = page.locator('#cart-badge');
    this.accountLink = page.locator('.header-actions .icon-btn').first();
  }
}
