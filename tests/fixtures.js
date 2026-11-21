import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { EventPage } from '../pages/EventPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

/**
 * @typedef {Object} PageFixtures
 * @property {HomePage} homePage
 * @property {EventPage} eventPage
 * @property {LoginPage} loginPage
 * @property {RegisterPage} registerPage
 */

// In plain JS the editor can't infer custom fixture types from base.extend(); declare them so
// // @ts-check specs know `registerPage`, `homePage`… exist (and get autocomplete).
/** @type {import('@playwright/test').TestType<import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & PageFixtures, import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions>} */
export const test = base.extend({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  eventPage: async ({ page }, use) => use(new EventPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
});

export { expect };
