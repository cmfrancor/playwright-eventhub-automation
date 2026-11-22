import { test as base, expect } from '@playwright/test';
import { EventHubApi } from '../api/EventHubApi';
import { HomePage } from '../pages/HomePage';
import { EventPage } from '../pages/EventPage';
import { LoginPage } from '../pages/LoginPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { RegisterPage } from '../pages/RegisterPage';

/**
 * @typedef {Object} Account
 * @property {string} email
 * @property {string} password
 * @property {string} token
 * @property {{ id: number, email: string }} user
 */

/**
 * Shape returned by POST /events. The API serializes `price` as a string (e.g. "150").
 * @typedef {Object} SeededEvent
 * @property {number} id
 * @property {string} title
 * @property {string} price
 * @property {number} totalSeats
 * @property {number} availableSeats
 */

/**
 * @typedef {Object} TestFixtures
 * @property {HomePage} homePage
 * @property {EventPage} eventPage
 * @property {LoginPage} loginPage
 * @property {MyBookingsPage} myBookingsPage
 * @property {RegisterPage} registerPage
 * @property {boolean} authenticated
 * @property {EventHubApi} api
 * @property {SeededEvent} event
 */

/**
 * @typedef {Object} WorkerFixtures
 * @property {string} apiURL
 * @property {Account} account
 */

// In plain JS the editor can't infer custom fixture types from base.extend(); declare them so
// `@ts-check` specs know `registerPage`, `homePage`… exist (and get autocomplete).
/** @type {import('@playwright/test').TestType<import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & TestFixtures, import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions & WorkerFixtures>} */
export const test = base.extend({
  // Value lives in playwright.config.js `use.apiURL`, next to baseURL.
  apiURL: [undefined, { option: true, scope: 'worker' }],

  account: [async ({ playwright, apiURL }, use, workerInfo) => {
    const email = `qa-w${workerInfo.workerIndex}-${Date.now()}@test.com`;
    const password = 'Worker123!';
    const request = await playwright.request.newContext({ baseURL: `${apiURL}/` });
    let registered;
    try {
      registered = await EventHubApi.register(request, email, password);
    } finally {
      await request.dispose();
    }
    await use({ email, password, ...registered });
  }, { scope: 'worker' }],

  authenticated: [false, { option: true }],

  // Depends on `account`, so every worker registers a user even when it never logs in (cheap, accepted).
  storageState: async ({ storageState, authenticated, account, baseURL }, use) => {
    if (!authenticated) {
      await use(storageState);
      return;
    }
    await use({
      cookies: [],
      origins: [{ origin: new URL(baseURL).origin, localStorage: [{ name: 'eventhub_token', value: account.token }] }],
    });
  },

  api: async ({ playwright, apiURL, account }, use) => {
    const request = await playwright.request.newContext({
      baseURL: `${apiURL}/`,
      extraHTTPHeaders: { Authorization: `Bearer ${account.token}` },
    });
    try {
      await use(new EventHubApi(request));
    } finally {
      await request.dispose();
    }
  },

  event: async ({ api }, use, testInfo) => {
    const event = await api.createEvent({
      title: `QA Event w${testInfo.workerIndex}-${testInfo.testId}-${Date.now()}`,
      description: 'Seeded by the automation suite; deleted in teardown.',
      category: 'Conference',
      venue: 'QA Convention Center',
      city: 'Lima',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      price: 150,
      totalSeats: 10,
    });
    await use(event);
    await api.deleteEvent(event.id);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  eventPage: async ({ page }, use) => use(new EventPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  myBookingsPage: async ({ page }, use) => use(new MyBookingsPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
});

export { expect };
