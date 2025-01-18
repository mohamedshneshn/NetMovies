import { LightningElement } from 'lwc';

export default class Rating extends LightningElement {
    selectedRating = 0;
    reviewText = '';
    stars = [1, 2, 3, 4, 5];

    get starIcons() {
        return this.stars.map((star) => ({
            value: star,
            iconName: star <= this.selectedRating ? 'utility:favorite' : 'utility:favorite_border',
        }));
    }

    handleStarClick(event) {
        this.selectedRating = parseInt(event.target.dataset.star, 10);
    }

    handleReviewInput(event) {
        this.reviewText = event.target.value;
    }

    handleSubmit() {
        const ratingData = {
            rating: this.selectedRating,
            review: this.reviewText,
        };
        console.log('Submitted Data:', ratingData);
        // Logic to send this data to the server can go here
    }

    handleCancel() {
        this.selectedRating = 0;
        this.reviewText = '';
        this.closeModal();
    }

    closeModal() {
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }
}
