import { expect } from '@playwright/test';
import { randomNumber } from '../helpers/randomHelper'


export class HomePage {
    
    constructor(page) {
        this.page = page;
        this.eventHubLogo = page.getByRole('link', { name: 'EventHub' });
        this.userEmailLabel = page.getByTestId('user-email-display');
        this.eventsList = page.getByTestId('event-card');
    }


    async isHomePageVisible(email) {
        await expect(this.eventHubLogo).toBeVisible();
        await expect(this.userEmailLabel).toHaveText(email)
    }

    async selectRandomEvent() {
        await expect(this.eventsList.first()).toBeVisible();
        const numberOfEvents = await this.eventsList.count();
        const randomEventNumber = randomNumber(0, numberOfEvents - 1);
        // .nth() y .locator() son síncronos: devuelven Locators, no necesitan await
        const selectedCard = this.eventsList.nth(randomEventNumber);
        const selectedCardName = selectedCard.locator('h3');
        const selectedCardPrice = selectedCard.locator('p');

        // .innerText() es asíncrono: aquí SÍ va el await. Leemos ANTES de hacer click
        const name = await selectedCardName.innerText();
        const price = await selectedCardPrice.innerText();

        await selectedCardName.click();

        return {name, price};
    }


}
