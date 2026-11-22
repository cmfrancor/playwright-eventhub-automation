// @ts-check
import { test, expect } from '../fixtures';
import {randomEmail} from '../../helpers/randomHelper'

test.beforeEach(async ({ registerPage }) => {
  await registerPage.goto();
  await registerPage.waitForLoaded();
})

test('Register successfully', async ({ registerPage, homePage }) => {
  const userEmail = randomEmail();
  await registerPage.register(userEmail);

  await homePage.waitForLoaded();
  await expect(homePage.userEmailLabel).toHaveText(userEmail);
});

const invalidPasswordCases = [
  { password: 'Password123', reason: 'No symbol' },
  { password: 'password123!', reason: 'No uppercase letter'},
  { password: 'Password!', reason: 'No number'},
  { password: 'Pass1!', reason: 'Less than 8 characters'},
]

for (const { password, reason } of invalidPasswordCases) {
  test(`Invalid Registration -  ${reason}`, async ({ registerPage }) => {
    await registerPage.register(randomEmail(), password)

    await expect(registerPage.invalidPasswordErrorMessage).toBeVisible();

  });
}

test('Invalid Registration - Passwords do not match', async({ registerPage }) => {
  await registerPage.register(randomEmail(), 'Password123!', 'DifferentPassword')

  await expect(registerPage.differentPasswordsErrorMessage).toBeVisible();
})

const invalidEmailCases = [
  { email: 'user1@email', reason: 'Invalid format 1' },
  { email: 'username1', reason: 'Invalid format 2'},
  { email: 'user1@email.', reason: 'Invalid format 3'},
]

for (const { email, reason } of invalidEmailCases) {
  test(`Invalid Registration -  ${reason}`, async ({ registerPage }) => {
    await registerPage.register(email)

    await expect(registerPage.invalidEmailErrorMessage).toBeVisible();

  });
}
