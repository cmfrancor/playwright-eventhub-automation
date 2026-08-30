import { expect } from '@playwright/test';

export class EventPage {
    
    constructor(page) {
        this.page = page;
        this.eventPageBreadCrumb = page.getByRole('main').getByRole('link', { name: 'Events' })
        this.eventNameTitle = page.locator('div h1')
        this.eventPrice = page.getByText('$').nth(1);
        this.eventCustomerFullNameField = page.getByRole('textbox', { name: 'Full Name*' });
        this.eventCustomerEmailField = page.getByTestId('customer-email');
        this.eventCustomerPhoneNumberField = page.getByRole('textbox', { name: 'Phone Number*' });
        this.eventConfirmBookingButton = page.getByRole('button', { name: 'Confirm Booking' });
        this.eventConfirmationMessage = page.getByRole('main');
        this.eventConfirmationCustomerName = page.locator('span:has-text("Customer") + span');
        this.eventConfirmationTicketsNumber = page.locator('span:has-text("Tickets") + span');
        this.eventConfirmationBookingRef = page.locator('span.booking-ref');
        this.eventViewMyBookingsButton = page.getByText('View My Bookings');
    }

    async isEventPageVisible(eventName, eventPrice) {
        await this.page.waitForURL('**/events/**');
        await expect(this.eventPageBreadCrumb).toBeVisible();
        await expect(this.eventNameTitle).toHaveText(eventName);
        await expect(this.eventPrice).toHaveText(eventPrice);
    }

    async purchaseEvent(customerName, customerEmail, customerPhoneNumber){
        await this.eventCustomerFullNameField.fill(customerName);
        await this.eventCustomerEmailField.fill(customerEmail);
        await this.eventCustomerPhoneNumberField.fill(customerPhoneNumber);
        await this.eventConfirmBookingButton.click()
    }

    async isPurchaseConfirmed(customerName, eventPrice, ticketsNumber = 1) {
        await expect(this.eventViewMyBookingsButton).toBeVisible();
        await expect(this.eventConfirmationMessage).toContainText('Booking Confirmed! 🎉');
        await expect(this.eventConfirmationCustomerName).toHaveText(customerName);
        await expect(this.eventPrice).toHaveText(eventPrice);
        const bookingRef = await this.eventConfirmationBookingRef.innerText();
        return bookingRef;
    }

}