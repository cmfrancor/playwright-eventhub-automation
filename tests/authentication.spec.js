// @ts-check
import { test } from '@playwright/test';
import {randomEmail} from '../helpers/randomHelper'
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage

 } from '../pages/HomePage';

const userEmail = randomEmail();
/** @type {RegisterPage} */
let registerPage;
/** @type {HomePage} */
let homePage;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  homePage = new HomePage(page);
})

test('Register successfully', async ({ page }) => {
  await page.goto('https://eventhub.rahulshettyacademy.com/register');

  await registerPage.login(userEmail);

  // Verify user is redirected to the homepage
  await homePage.isHomePageVisible(userEmail);

});