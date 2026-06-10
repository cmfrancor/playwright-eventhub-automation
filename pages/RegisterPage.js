import { expect } from '@playwright/test';


export class RegisterPage {
    
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByTestId('register-email');
        this.passwordInput = page.getByTestId('register-password');
        this.confirmPasswordInput = page.getByRole('textbox', { name: 'Repeat your password' });
        this.registerButton = page.getByTestId('register-btn');
        this.invalidPasswordErrorMessage = page.getByText('Password does not meet the requirements below')
        this.differentPasswordsErrorMessage = page.getByText('Passwords do not match');
        this.invalidEmailErrorMessage = page.getByText('Enter a valid email')
    }


    async register(email, password = 'Password123!', confirmPassword = 'Password123!') {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(confirmPassword);
        await this.registerButton.click();
    }

    async expectPasswordInvalid() {
        await expect(this.invalidPasswordErrorMessage).toBeVisible();
    }

    async expectConfirmPasswordDifferent() {
        await expect(this.differentPasswordsErrorMessage).toBeVisible();
    }

    async expectEmailInvalid() {
        await expect(this.invalidEmailErrorMessage).toBeVisible();
    }


}
