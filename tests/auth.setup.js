import { test as setup, expect } from './fixtures';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, loginPage, homePage }) => {
  await homePage.goto();
  await loginPage.login(process.env.EVENTHUB_EMAIL, process.env.EVENTHUB_PASSWORD);

  // Esperamos a que el login REALMENTE termine (home autenticada visible)
  // antes de capturar el estado. Si no, guardamos una sesión todavía vacía.
  await homePage.waitForLoaded();
  await expect(homePage.userEmailLabel).toHaveText(process.env.EVENTHUB_EMAIL);

  // Ahora el token/cookies ya están en el navegador → recién aquí los guardamos.
  await page.context().storageState({ path: authFile });
});
