import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  await page.goto('https://eventhub.rahulshettyacademy.com');
  await loginPage.login(process.env.EVENTHUB_EMAIL, process.env.EVENTHUB_PASSWORD);

  // Esperamos a que el login REALMENTE termine (home autenticada visible)
  // antes de capturar el estado. Si no, guardamos una sesión todavía vacía.
  await homePage.isHomePageVisible(process.env.EVENTHUB_EMAIL);

  // Ahora el token/cookies ya están en el navegador → recién aquí los guardamos.
  await page.context().storageState({ path: authFile });
});