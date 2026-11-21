import { expect } from '@playwright/test';
import { randomNumber } from '../helpers/randomHelper'


export class HomePage {
    
    constructor(page) {
        this.page = page;
        this.eventHubLogo = page.getByRole('link', { name: 'EventHub' });
        this.userEmailLabel = page.getByTestId('user-email-display');
        this.eventsList = page.getByTestId('event-card');
        // Every run books a real seat and nothing releases it yet, so only cards with ≥1 seat are bookable.
        // TODO (Phase 3): cancel the booking in a teardown via API instead of steering around sold-out events.
        this.bookableEvents = this.eventsList.filter({ hasText: /\b[1-9][\d,]* seats? (left|available)/ });
    }


    async goto() {
        await this.page.goto('/');
    }

    async waitForLoaded() {
        await expect(this.page).toHaveURL('/');
        await expect(this.eventHubLogo).toBeVisible();
    }

    async selectRandomEvent() {
        await expect(this.bookableEvents, 'no event has seats left to book').not.toHaveCount(0);
        const numberOfEvents = await this.bookableEvents.count();
        const randomEventNumber = randomNumber(0, numberOfEvents - 1);
        // .nth() y .locator() son síncronos: devuelven Locators, no necesitan await
        // .nth() is legitimate here: picking a random card by position is the point.
        const selectedCard = this.bookableEvents.nth(randomEventNumber);
        const selectedCardName = selectedCard.getByRole('heading');
        const selectedCardPrice = selectedCard.getByText(/^\s*\$\s?\d/);

        // .innerText() es asíncrono: aquí SÍ va el await. Leemos ANTES de hacer click
        const name = await selectedCardName.innerText();
        const price = await selectedCardPrice.innerText();

        await selectedCardName.click();

        return {name, price};
    }


}
