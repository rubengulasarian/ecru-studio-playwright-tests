import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { TestUser } from '../data/users';

/** The "Account" page that hosts both the sign-up and the log-in form. */
export class RegisterPage extends BasePage {
  // Sign-up
  readonly name: Locator = this.page.locator('#r-name');
  readonly email: Locator = this.page.locator('#r-email');
  readonly password: Locator = this.page.locator('#r-pass');
  readonly confirmPassword: Locator = this.page.locator('#r-pass2');
  readonly createAccountButton: Locator = this.page.locator('#do-register');
  readonly successBanner: Locator = this.page.locator('.banner-ok');
  readonly nameError: Locator = this.page.locator('#e-name');
  readonly emailError: Locator = this.page.locator('#e-email');
  readonly passwordError: Locator = this.page.locator('#e-pass');
  // Log-in
  readonly showLoginLink: Locator = this.page.locator('#to-login');
  readonly loginEmail: Locator = this.page.locator('#l-email');
  readonly loginPassword: Locator = this.page.locator('#l-pass');
  readonly loginButton: Locator = this.page.locator('#do-login');
  readonly loginError: Locator = this.page.locator('#e-login');

  async open(): Promise<void> {
    await this.page.goto('/register.html');
  }

  async register(user: TestUser, confirmation: string = user.password): Promise<void> {
    await this.name.fill(user.name);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.confirmPassword.fill(confirmation);
    await this.createAccountButton.click();
  }

  async logIn(email: string, password: string): Promise<void> {
    await this.showLoginLink.click();
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }
}
