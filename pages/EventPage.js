import { expect } from '@playwright/test';

export class EventPage {
    
    constructor(page) {
        this.page = page;
        this.eventPageBreadCrumb = page.getByRole('main').getByRole('link', { name: 'Events' })
        this.eventNameTitle = page.getByRole('heading', { name: 'Dilli Diwali Mela' });
        this.eventPrice = page.getByText('$').nth(1);
    }

    async isEventPageVisible(eventName, eventPrice) {
        await this.page.waitForURL('**/events/**');
        await expect(this.eventPageBreadCrumb).toBeVisible();
        await expect(this.eventNameTitle).toHaveText(eventName);
        await expect(this.eventPrice).toHaveText(eventPrice);
    }

}