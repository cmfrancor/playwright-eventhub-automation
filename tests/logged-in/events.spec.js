// @ts-check
import { test, expect } from '../fixtures';

const customerName = 'QA Customer';
const customerPhoneNumber = '5551234567';

test('Purchase Event', async ({ homePage, eventPage, myBookingsPage, event, account, api }) => {
  const price = `$${event.price}`;

  await homePage.goto();
  await expect(homePage.eventCardPrice(event.title)).toHaveText(price);
  await expect(homePage.eventCardSeats(event.title)).toHaveText(`${event.totalSeats} seats left!`);
  await homePage.openEvent(event.title);

  await eventPage.waitForLoaded();
  await expect(eventPage.eventNameTitle).toHaveText(event.title);
  await expect(eventPage.eventPrice).toHaveText(price);

  await eventPage.purchaseEvent(customerName, account.email, customerPhoneNumber);

  await expect(eventPage.eventConfirmationHeading).toHaveText('Booking Confirmed! 🎉');
  await expect(eventPage.confirmationValue('Customer')).toHaveText(customerName);
  await expect(eventPage.confirmationValue('Tickets')).toHaveText('1');
  // Single ticket, so the total equals the unit price.
  await expect(eventPage.confirmationValue('Total')).toHaveText(price);
  await expect(eventPage.confirmationValue('Booking Ref')).toHaveText(/^[A-Z]-[A-Z0-9]{6}$/);
  const bookingRef = await eventPage.confirmationValue('Booking Ref').innerText();

  await eventPage.eventViewMyBookingsLink.click();
  await myBookingsPage.waitForLoaded();
  await expect(myBookingsPage.bookingCard(bookingRef).getByText('confirmed', { exact: true })).toBeVisible();
  await expect(myBookingsPage.bookingTitle(bookingRef)).toHaveText(event.title);
  await expect(myBookingsPage.bookingTickets(bookingRef)).toHaveText(/(^|\s)1 ticket$/);
  await expect(myBookingsPage.bookingTotal(bookingRef)).toHaveText(price);

  // The customer email is stored with the booking but shown nowhere in the UI.
  const booking = await api.getBookingByRef(bookingRef);
  expect(booking).toMatchObject({ customerEmail: account.email });
});
