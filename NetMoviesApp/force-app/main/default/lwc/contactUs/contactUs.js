import { LightningElement, track } from 'lwc';

export default class ContactUs extends LightningElement {

        @track name = '';
    @track email = '';
    @track message = '';

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleMessageChange(event) {
        this.message = event.target.value;
    }

    handleSubmit() {
        // Logic to handle form submission
        // You can send data to Salesforce, log it, or call an API.
        console.log('Name:', this.name);
        console.log('Email:', this.email);
        console.log('Message:', this.message);

        // Reset fields after submission
        this.name = '';
        this.email = '';
        this.message = '';
    }
}