// @ts-check
import { test, expect } from '../fixtures';

const customerEmail = process.env.EVENTHUB_EMAIL;
const customerName = process.env.CUSTOMER_NAME;
const customerPhoneNumber = process.env.CUSTOMER_PHONE_NUMBER;

test('Purchase Event', async ({ homePage, eventPage }) => {
  await homePage.goto();
  const { name, price } = await homePage.selectRandomEvent();
  await eventPage.waitForLoaded();
  await expect(eventPage.eventNameTitle).toHaveText(name);
  await expect(eventPage.eventPrice).toHaveText(price);

  await eventPage.purchaseEvent(customerName, customerEmail, customerPhoneNumber);

  await expect(eventPage.eventConfirmationHeading).toHaveText('Booking Confirmed! 🎉');
  await expect(eventPage.confirmationValue('Customer')).toHaveText(customerName);
  await expect(eventPage.confirmationValue('Tickets')).toHaveText('1');
  // Single ticket, so the total equals the unit price.
  await expect(eventPage.confirmationValue('Total')).toHaveText(price);
  await expect(eventPage.confirmationValue('Booking Ref')).not.toBeEmpty();
  await expect(eventPage.eventViewMyBookingsLink).toBeVisible();
});
