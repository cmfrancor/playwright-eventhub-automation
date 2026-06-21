// @ts-check
import { test } from '@playwright/test';
import {randomEmail} from '../../helpers/randomHelper'
import { RegisterPage } from '../../pages/RegisterPage';
import { HomePage} from '../../pages/HomePage';

const userEmail = randomEmail();
/** @type {RegisterPage} */
let registerPage;
/** @type {HomePage} */
let homePage;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  homePage = new HomePage(page);
  await page.goto('https://eventhub.rahulshettyacademy.com/register');
})

test.only('Register successfully', async ({ page }) => {
  await registerPage.register(userEmail);

  // Verify user is redirected to the homepage
  await homePage.isHomePageVisible(userEmail);

});

const invalidPasswordCases = [
  { password: 'Password123', reason: 'No symbol' },
  { password: 'password123!', reason: 'No uppercase letter'},
  { password: 'Password!', reason: 'No number'},
  { password: 'Pass1!', reason: 'Less than 8 characters'},
]

for (const { password, reason } of invalidPasswordCases) {
  test(`Invalid Registration -  ${reason}`, async ({ page }) => {
    await registerPage.register(userEmail, password)

    await registerPage.expectPasswordInvalid()

  });
}

test('Invalid Registration - Passwords do not match', async({page}) => {
  await registerPage.register(userEmail, 'Password123!', 'DifferentPassword')

  await registerPage.expectConfirmPasswordDifferent();
})

const invalidEmailCases = [
  { email: 'user1@email', reason: 'Invalid format 1' },
  { email: 'username1', reason: 'Invalid format 2'},
  { email: 'user1@email.', reason: 'Invalid format 3'},
]

for (const { email, reason } of invalidEmailCases) {
  test(`Invalid Registration -  ${reason}`, async ({ page }) => {
    await registerPage.register(email)

    await registerPage.expectEmailInvalid()

  });
}