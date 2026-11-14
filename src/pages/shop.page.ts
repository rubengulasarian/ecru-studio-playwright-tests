import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { parseMoney } from '../helpers/money';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

export class ShopPage extends BasePage {
  readonly search: Locator = this.page.locator('#search');
  readonly category: Locator = this.page.locator('#category');
  readonly priceMin: Locator = this.page.locator('#price-min');
  readonly priceMax: Locator = this.page.locator('#price-max');
  readonly sort: Locator = this.page.locator('#sort');
  readonly resultCount: Locator = this.page.locator('#result-count');
  readonly cards: Locator = this.page.locator('#grid .card');
  readonly emptyMessage: Locator = this.page.getByText('Nothing found.');

  async open(query = ''): Promise<void> {
    await this.page.goto(`/shop.html${query}`);
  }

  async searchFor(text: string): Promise<void> {
    await this.search.fill(text);
  }

  async selectCategory(name: string): Promise<void> {
    await this.category.selectOption(name);
  }

  async selectSort(option: SortOption): Promise<void> {
    await this.sort.selectOption(option);
  }

  async setPriceRange(range: { min?: number; max?: number }): Promise<void> {
    if (range.min !== undefined) await this.priceMin.fill(String(range.min));
    if (range.max !== undefined) await this.priceMax.fill(String(range.max));
  }

  card(id: number): Locator {
    return this.cards.filter({ has: this.page.locator(`[data-add="${id}"]`) });
  }

  addButton(id: number): Locator {
    return this.page.locator(`[data-add="${id}"]`);
  }

  addToCart(id: number): Promise<void> {
    return this.addButton(id).click();
  }

  wishButton(id: number): Locator {
    return this.page.locator(`.wish[data-id="${id}"]`);
  }

  productImage(id: number): Locator {
    return this.page.locator(`a[href$="product.html?id=${id}"] img`);
  }

  /** Prices of the currently listed products (the current price, not the struck-through one). */
  async prices(): Promise<number[]> {
    const texts = await this.cards.locator('.price').allTextContents();
    return texts.map(parseMoney);
  }

  async categories(): Promise<string[]> {
    return this.cards.locator('.card-cat').allTextContents();
  }

  async names(): Promise<string[]> {
    return this.cards.locator('.card-name').allTextContents();
  }
}
