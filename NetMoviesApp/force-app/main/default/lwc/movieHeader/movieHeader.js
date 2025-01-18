import { LightningElement, api } from 'lwc';

export default class MovieHeader extends LightningElement {
    @api headerText; // This will accept the text to display in the header
}
