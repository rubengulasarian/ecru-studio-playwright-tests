import { test, expect } from '../src/fixtures';
import { knownBug } from '../src/helpers/known-bug';
import { newUser } from '../src/data/users';

test.describe('Registration, login and account', () => {
  test('a new customer can create an account', async ({ registerPage, accountPage, page }) => {
    const user = newUser();
    await registerPage.open();
    await registerPage.register(user);

    await expect(registerPage.successBanner).toHaveText('Account created. Welcome!');
    await expect(page).toHaveURL(/account/);
    await expect(accountPage.heading).toBeVisible();
    await expect(accountPage.displayName).toHaveText(user.name);
    await expect(accountPage.displayEmail).toHaveText(user.email);
    await expect(accountPage.accountLink).toHaveText('Anna'); // header shows the first name
  });

  test.describe('required fields', () => {
    const cases = [
      { missing: 'name', values: { name: '', email: 'a@b.com', password: 'x' }, error: 'nameError', text: 'Enter your name' },
      { missing: 'email', values: { name: 'Anna', email: '', password: 'x' }, error: 'emailError', text: 'Enter your email' },
      { missing: 'password', values: { name: 'Anna', email: 'a@b.com', password: '' }, error: 'passwordError', text: 'Choose a password' },
    ] as const;

    for (const { missing, values, error, text } of cases) {
      test(`registration requires a ${missing}`, async ({ registerPage }) => {
        await registerPage.open();
        await registerPage.register({ ...values }, values.password);
        await expect(registerPage[error]).toHaveText(text);
        await expect(registerPage.successBanner).toHaveCount(0);
      });
    }
  });

  test('an existing customer can log in', async ({ site, registerPage, accountPage, page }) => {
    const user = newUser();
    await site.seed({ users: [{ name: user.name, email: user.email, pass: user.password }] });
    await registerPage.open();
    await registerPage.logIn(user.email, user.password);

    await expect(page).toHaveURL(/account/);
    await expect(accountPage.displayName).toHaveText(user.name);
  });

  test('logging in with an unknown email shows an error', async ({ registerPage }) => {
    await registerPage.open();
    await registerPage.logIn('nobody@example.com', 'whatever');
    await expect(registerPage.loginError).toHaveText('User not found');
  });

  test('the account page asks guests to log in', async ({ accountPage, page }) => {
    await accountPage.open();
    await expect(page.getByRole('heading', { name: "You're not logged in" })).toBeVisible();
  });

  test('a logged-in customer can log out', async ({ site, accountPage, page }) => {
    await site.seedLoggedInUser(newUser());
    await accountPage.open();
    await accountPage.logoutButton.click();
    await expect(page).toHaveURL(/\/(index(\.html)?)?$/);
    await expect(accountPage.accountLink).toHaveText('Log in');
  });

  test('profile details are saved and kept after a reload', async ({ site, accountPage, page }) => {
    await site.seedLoggedInUser(newUser());
    await accountPage.open();
    await accountPage.phone.fill('+4915112345678');
    await accountPage.saveProfileButton.click();
    await expect(accountPage.profileToast).toHaveText('Profile saved.');
    await page.reload();
    await expect(accountPage.phone).toHaveValue('+4915112345678');
  });

  test('the shipping address is saved and kept after a reload', async ({ site, accountPage, page }) => {
    await site.seedLoggedInUser(newUser());
    await accountPage.open();
    await accountPage.country.selectOption('Germany');
    await accountPage.city.fill('Berlin');
    await accountPage.street.fill('Hauptstrasse 1');
    await accountPage.zip.fill('10115');
    await accountPage.saveAddressButton.click();
    await expect(accountPage.addressToast).toHaveText('Address saved.');
    await page.reload();
    await expect(accountPage.country).toHaveValue('Germany');
    await expect(accountPage.city).toHaveValue('Berlin');
    await expect(accountPage.street).toHaveValue('Hauptstrasse 1');
    await expect(accountPage.zip).toHaveValue('10115');
  });

  test('a saved card is shown masked with its brand', async ({ site, accountPage }) => {
    await site.seedLoggedInUser(newUser());
    await accountPage.open();
    await accountPage.cardNumber.fill('4242 4242 4242 4242');
    await accountPage.cardExpiry.fill('12/30');
    await accountPage.saveCardButton.click();
    await expect(accountPage.cardToast).toHaveText('Card saved.');
    // the page reloads itself after saving
    await expect(accountPage.savedCardBrand).toHaveText('Visa');
    await expect(accountPage.savedCard).toContainText('•••• •••• •••• 4242');
  });

  test.describe('known defects', () => {
    test('@known-bug L7a passwords must match when registering', async ({ registerPage }) => {
      knownBug('L7a', 'the "Confirm password" field is never compared with "Password"');
      await registerPage.open();
      await registerPage.register(newUser(), 'a-different-password');
      await expect(registerPage.passwordError).toHaveText(/\S/);
    });

    test('@known-bug L7b an email can be registered only once', async ({ site, registerPage }) => {
      knownBug('L7b', 'duplicate accounts with the same email are allowed');
      const existing = newUser();
      await site.seed({ users: [{ name: existing.name, email: existing.email, pass: existing.password }] });
      await registerPage.open();
      await registerPage.register(newUser({ email: existing.email }));
      await expect(registerPage.emailError).toHaveText(/\S/);
    });

    test('@known-bug L7c log-in is rejected for a wrong password', async ({ site, registerPage }) => {
      knownBug('L7c', 'the password is never verified on log-in');
      const user = newUser();
      await site.seed({ users: [{ name: user.name, email: user.email, pass: user.password }] });
      await registerPage.open();
      await registerPage.logIn(user.email, 'definitely-wrong');
      await expect(registerPage.loginError).toHaveText(/\S/);
    });

    test('@known-bug H2 the header shows the updated name after the profile is saved', async ({ site, accountPage, page }) => {
      knownBug('H2', 'profile update does not refresh the active session, so the header keeps the old name');
      await site.seedLoggedInUser(newUser({ name: 'Anna Ivanova' }));
      await accountPage.open();
      await accountPage.fullName.fill('Maria Petrova');
      await accountPage.saveProfileButton.click();
      await expect(accountPage.profileToast).toHaveText('Profile saved.');
      await page.reload();
      await expect(accountPage.accountLink).toHaveText('Maria');
    });
  });
});
