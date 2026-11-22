import { expect } from '@playwright/test';


export class HomePage {

    constructor(page) {
        this.page = page;
        this.eventHubLogo = page.getByRole('link', { name: 'EventHub' });
        this.userEmailLabel = page.getByTestId('user-email-display');
        this.eventsList = page.getByTestId('event-card');
    }


    async goto() {
        await this.page.goto('/');
    }

    async waitForLoaded() {
        await expect(this.page).toHaveURL('/');
        await expect(this.eventHubLogo).toBeVisible();
    }

    eventCard(title) {
        return this.eventsList.filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
    }

    eventCardPrice(title) {
        return this.eventCard(title).getByText(/^\$/);
    }

    eventCardSeats(title) {
        return this.eventCard(title).getByText(/seats? left/);
    }

    async openEvent(title) {
        await this.eventCard(title).getByTestId('book-now-btn').click();
    }

}
