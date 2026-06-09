class RegisterPage {
    
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByTestId('register-email');
        this.passwordInput = page.getByTestId('register-password');
        this.confirmPasswordInput = page.getByRole('textbox', { name: 'Repeat your password' });
        this.registerButton = page.getByTestId('register-btn');
    }


    async login(email, password = 'Password123!') {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(password);
        await this.registerButton.click();
    }


}

module.exports = { RegisterPage };