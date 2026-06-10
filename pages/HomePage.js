import { expect } from '@playwright/test';


export class HomePage {
    
    constructor(page) {
        this.page = page;
        this.eventHubLogo = page.getByRole('link', { name: 'EventHub' });
        this.userEmailLabel = page.getByTestId('user-email-display');
    }


    async isHomePageVisible(email) {
        await expect(this.eventHubLogo).toBeVisible();
        await expect(this.userEmailLabel).toHaveText(email)
    }


}
