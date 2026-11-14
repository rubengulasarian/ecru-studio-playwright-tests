import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductPage extends BasePage {
  readonly title: Locator = this.page.getByRole('heading', { level: 1 });
  readonly categoryLabel: Locator = this.page.locator('.product-info .eyebrow');
  readonly price: Locator = this.page.locator('.product-price');
  readonly quantity: Locator = this.page.locator('#qty');
  readonly increase: Locator = this.page.locator('#inc');
  readonly decrease: Locator = this.page.locator('#dec');
  readonly addToCartButton: Locator = this.page.locator('#add');
  readonly lineTotal: Locator = this.page.locator('#line-total');
  readonly shippingNote: Locator = this.page.getByText(/Free over/);
  readonly notFound: Locator = this.page.getByRole('heading', { name: 'Product not found' });

  async open(id: number): Promise<void> {
    await this.page.goto(`/product.html?id=${id}`);
  }
}
