import { test as base, expect, type Page } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';
import { ProductPage } from './pages/product.page';
import { RegisterPage } from './pages/register.page';
import { ShopPage } from './pages/shop.page';
import type { TestUser } from './data/users';

export interface CartItem {
  id: number;
  qty: number;
}

export interface StoredState {
  cart?: CartItem[];
  users?: Array<{ name: string; email: string; pass: string }>;
  session?: { name: string; email: string };
  profile?: Record<string, unknown>;
}

const STORAGE_KEYS: Record<keyof StoredState, string> = {
  cart: 'ecru_cart',
  users: 'ecru_users',
  session: 'ecru_session',
  profile: 'ecru_profile',
};

/**
 * The site keeps all of its data in localStorage. Seeding it directly is much faster
 * and more stable than clicking through the UI to build up the same state.
 */
export class SiteState {
  constructor(private readonly page: Page) {}

  async seed(state: StoredState): Promise<void> {
    await this.page.goto('/');
    const entries = Object.entries(state).map(([key, value]) => [
      STORAGE_KEYS[key as keyof StoredState],
      JSON.stringify(value),
    ]);
    await this.page.evaluate((pairs) => {
      for (const [key, value] of pairs) localStorage.setItem(key, value);
    }, entries);
  }

  /** Registers the user in the "database" and signs them in. */
  async seedLoggedInUser(user: TestUser): Promise<void> {
    await this.seed({
      users: [{ name: user.name, email: user.email, pass: user.password }],
      session: { name: user.name, email: user.email },
      profile: { name: user.name, email: user.email },
    });
  }
}

interface Fixtures {
  shopPage: ShopPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  registerPage: RegisterPage;
  accountPage: AccountPage;
  site: SiteState;
}

export const test = base.extend<Fixtures>({
  shopPage: async ({ page }, use) => use(new ShopPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  site: async ({ page }, use) => use(new SiteState(page)),
});

export { expect };
