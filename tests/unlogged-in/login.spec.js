// @ts-check
import { test, expect } from '../fixtures';

test('Login successfully', async ({ account, loginPage, homePage }) => {
  await loginPage.goto();
  await loginPage.login(account.email, account.password);

  await homePage.waitForLoaded();
  await expect(homePage.userEmailLabel).toHaveText(account.email);
});
