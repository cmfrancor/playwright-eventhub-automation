import { expect } from '@playwright/test';

export class EventPage {

    constructor(page) {
        this.page = page;
        this.eventPageBreadCrumb = page.getByRole('main').getByRole('link', { name: 'Events' });
        this.eventNameTitle = page.getByRole('heading', { level: 1 });
        this.eventPrice = this.#rowValue(page, 'Price per ticket');
        this.eventCustomerFullNameField = page.getByRole('textbox', { name: 'Full Name*' });
        this.eventCustomerEmailField = page.getByTestId('customer-email');
        this.eventCustomerPhoneNumberField = page.getByRole('textbox', { name: 'Phone Number*' });
        this.eventConfirmBookingButton = page.getByRole('button', { name: 'Confirm Booking' });
        this.eventConfirmationHeading = page.getByRole('heading', { name: /Booking Confirmed/ });
        // Scoped to the confirmation because "Tickets"/"Total" also exist in the booking form.
        this.eventConfirmationMessage = this.eventConfirmationHeading.locator('..');
        this.eventViewMyBookingsLink = page.getByRole('link', { name: 'View My Bookings' });
    }

    // No testids: anchor on the label, hop to its row ('..'), take the row's last child as the value.
    // Assumes each row is [label, value]. TODO: ask dev for row testids (event-price, booking-*).
    #rowValue(scope, label) {
        return scope.getByText(label, { exact: true }).locator('..').locator(':scope > *').last();
    }

    confirmationValue(label) {
        return this.#rowValue(this.eventConfirmationMessage, label);
    }

    async goto(eventId) {
        await this.page.goto(`/events/${eventId}`);
    }

    async waitForLoaded() {
        await this.page.waitForURL('**/events/**');
        await expect(this.eventPageBreadCrumb).toBeVisible();
    }

    async purchaseEvent(customerName, customerEmail, customerPhoneNumber){
        await this.eventCustomerFullNameField.fill(customerName);
        await this.eventCustomerEmailField.fill(customerEmail);
        await this.eventCustomerPhoneNumberField.fill(customerPhoneNumber);
        await this.eventConfirmBookingButton.click();
    }

}
