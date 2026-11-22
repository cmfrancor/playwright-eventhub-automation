import { expect } from '@playwright/test';

export class MyBookingsPage {

    constructor(page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'My Bookings' });
        this.bookingsList = page.getByTestId('booking-card');
    }

    async waitForLoaded() {
        await expect(this.page).toHaveURL('/bookings');
        await expect(this.heading).toBeVisible();
    }

    bookingCard(ref) {
        return this.bookingsList.filter({ has: this.page.getByText(ref, { exact: true }) });
    }

    bookingTitle(ref) {
        return this.bookingCard(ref).getByRole('heading');
    }

    bookingTotal(ref) {
        return this.bookingCard(ref).getByText(/^\$/);
    }

    bookingTickets(ref) {
        return this.bookingCard(ref).getByText(/\b\d+ tickets?\b/);
    }

}
