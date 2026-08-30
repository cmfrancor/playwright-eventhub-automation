import { test } from '@playwright/test';
import {randomEmail} from '../../helpers/randomHelper'
import { RegisterPage } from '../../pages/RegisterPage';
import { HomePage} from '../../pages/HomePage';
import { EventPage } from '../../pages/EventPage'

/** @type {RegisterPage} */
let registerPage;
/** @type {HomePage} */
let homePage;
/** @type {EventPage} */
let eventPage;

let eventName = '';
let eventPrice = '';
let bookingRef = '';
const customerEmail = process.env.EVENTHUB_EMAIL;
const customerName = process.env.CUSTOMER_NAME;
const customerPhoneNumber = process.env.CUSTOMER_PHONE_NUMBER;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  homePage = new HomePage(page);
  eventPage = new EventPage(page);
  await page.goto('https://eventhub.rahulshettyacademy.com');
})

test('Purchase Event', async ({ page }) => {
    const result = await homePage.selectRandomEvent();
    eventName = result.name;
    eventPrice = result.price;
    await eventPage.isEventPageVisible(eventName, eventPrice);
    await eventPage.purchaseEvent(customerName,customerEmail,customerPhoneNumber);
    bookingRef = await eventPage.isPurchaseConfirmed(customerName, eventPrice);
});