import { expect } from '@playwright/test';

export class EventPage {

    constructor(page) {
        this.page = page;
        this.eventPageBreadCrumb = page.getByRole('main').getByRole('link', { name: 'Events' })
        this.eventNameTitle = page.getByRole('heading', { level: 1 });
        // No testids here: anchor on the label, hop to its row ('..'), assert the row's [label, value] children.
        // Assumes each row is exactly those two elements. TODO: ask dev for row testids (event-price, booking-*).
        this.eventPrice = page.getByText('Price per ticket', { exact: true }).locator('..');
        this.eventCustomerFullNameField = page.getByRole('textbox', { name: 'Full Name*' });
        this.eventCustomerEmailField = page.getByTestId('customer-email');
        this.eventCustomerPhoneNumberField = page.getByRole('textbox', { name: 'Phone Number*' });
        this.eventConfirmBookingButton = page.getByRole('button', { name: 'Confirm Booking' });
        this.eventConfirmationHeading = page.getByRole('heading', { name: /Booking Confirmed/ });
        // Scoped to the confirmation because "Tickets"/"Total" also exist in the booking form.
        this.eventConfirmationMessage = this.eventConfirmationHeading.locator('..');
        this.eventConfirmationCustomerName = this.eventConfirmationMessage.getByText('Customer', { exact: true }).locator('..');
        this.eventConfirmationTicketsNumber = this.eventConfirmationMessage.getByText('Tickets', { exact: true }).locator('..');
        this.eventConfirmationTotal = this.eventConfirmationMessage.getByText('Total', { exact: true }).locator('..');
        // CSS class on purpose: semantic, unique, and there's no role/testid. TODO: ask dev for data-testid="booking-ref".
        this.eventConfirmationBookingRef = this.eventConfirmationMessage.locator('.booking-ref');
        this.eventViewMyBookingsLink = page.getByRole('link', { name: 'View My Bookings' });
    }

    async isEventPageVisible(eventName, eventPrice) {
        await this.page.waitForURL('**/events/**');
        await expect(this.eventPageBreadCrumb).toBeVisible();
        await expect(this.eventNameTitle).toHaveText(eventName);
        await expect(this.eventPrice.locator('p')).toHaveText(['Price per ticket', eventPrice]);
    }

    async purchaseEvent(customerName, customerEmail, customerPhoneNumber){
        await this.eventCustomerFullNameField.fill(customerName);
        await this.eventCustomerEmailField.fill(customerEmail);
        await this.eventCustomerPhoneNumberField.fill(customerPhoneNumber);
        await this.eventConfirmBookingButton.click()
    }

    async isPurchaseConfirmed(customerName, expectedTotal, ticketsNumber = 1) {
        await expect(this.eventViewMyBookingsLink).toBeVisible();
        await expect(this.eventConfirmationHeading).toHaveText('Booking Confirmed! 🎉');
        await expect(this.eventConfirmationCustomerName.locator('span')).toHaveText(['Customer', customerName]);
        await expect(this.eventConfirmationTicketsNumber.locator('span')).toHaveText(['Tickets', String(ticketsNumber)]);
        await expect(this.eventConfirmationTotal.locator('span')).toHaveText(['Total', expectedTotal]);
        return this.eventConfirmationBookingRef.innerText();
    }

}
