import { LightningElement, api, track } from 'lwc';
import getMovieDetails from '@salesforce/apex/TMDBService.getMovieDetails';
import createUserMovieInteraction from '@salesforce/apex/TMDBService.createUserMovieInteraction';

import isUserLoggedIn from '@salesforce/apex/TMDBService.isUserLoggedIn';

export default class MovieDetail extends LightningElement {
    @track movieId;
    @track movie = {};
    @track filledStars = [];
    @track emptyStars = [];
    @track isLoggedIn = false;
    @track showSignInMessage = false;
    @track isLiked = false;
    @track isWatched = false;
    @track showCommentModal = false;
    @track userComment = '';
    @track selectedRating = 0;
        @track hoverRating = 0;    // Holds the hovered rating

     // Base array of stars
    baseStars = [
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 }
    ];

     // Compute stars with dynamic classes
    get computedStars() {
        return this.baseStars.map(star => ({
            ...star,
            class: star.value <= this.hoverRating || star.value <= this.selectedRating
                ? 'star2 selected'
                : 'star2'
        }));
    }
    
   
    connectedCallback() {
        this.updateMovieIdFromUrl();
        this.fetchMovieDetails();
        this.checkUserLogin();

        this.startUrlObserver();
    }

    disconnectedCallback() {
        // Cleanup observer
        this.stopUrlObserver();
    }

    startUrlObserver() {
        this.urlObserver = setInterval(() => {
            this.updateMovieIdFromUrl();
        }, 500); // Check every 500ms
    }

    stopUrlObserver() {
            if (this.urlObserver) {
                clearInterval(this.urlObserver);
            }
    }

    handleUrlChange() {
        this.updateMovieIdFromUrl();
        this.fetchMovieDetails();
    }

    updateMovieIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const newMovieId = urlParams.get('movieId');

        if (newMovieId !== this.movieId) {
            this.movieId = newMovieId;
            this.resetStars();
            this.fetchMovieDetails();
         
        } 
    }

    fetchMovieDetails() {
        getMovieDetails({ movieId: this.movieId })
            .then((data) => {
                this.movie = data;
                // Recalculate stars after fetching movie details
                this.calculateStars();
            })
            .catch((error) => {
                console.error('Error fetching movie details:', error);
            });
    }

    checkUserLogin() {
        isUserLoggedIn()
            .then((result) => {
                this.isLoggedIn = result;
            })
            .catch((error) => {
                console.error('Error checking user login state:', error);
            });
    }

    handleLike() {
        if (!this.isLoggedIn) {
            this.displaySignInMessage();
            return;
        }
        this.isLiked = !this.isLiked;
 
    }

    handleWatch() {
        if (!this.isLoggedIn) {
            this.displaySignInMessage();
            return;
        }
        this.isWatched = !this.isWatched;

        // Call the unified Apex method with watch status
        createUserMovieInteraction({
            movieId: this.movieId,
            watchStatus: this.isWatched,
            userComment: null, // No comment update
            userRating: null   // No rating update
        })
            .then(() => {
                console.log('User movie interaction updated successfully');
            })
            .catch((error) => {
                console.error('Error updating user movie interaction:', error);
            });
    }


    handleReview() {
        if (!this.isLoggedIn) {
            this.displaySignInMessage();
            return;
        }
        this.showCommentModal = true;
    }

    handleCommentChange(event) {
        this.userComment = event.target.value;
    }

    handleCommentSubmit() {
        if (this.userComment.trim() === '') {
            alert('Comment cannot be empty!');
            return;
        }
        console.log(`Rating: ${this.selectedRating}`);
        console.log(`Comment: ${this.userComment}`);

        // Call the unified Apex method with comment and rating
        createUserMovieInteraction({
            movieId: this.movieId,
            watchStatus: null, // No watch status change
            userComment: this.userComment,
            userRating: this.selectedRating
        })
            .then(() => {
                console.log('User movie interaction updated successfully');
                alert('Thank you for your feedback!');
                this.userComment = ''; // Reset the comment
                this.selectedRating = 0; // Reset the rating
            })
            .catch((error) => {
                console.error('Error updating user movie interaction:', error);
                alert('An error occurred. Please try again later.');
            });

        this.closeModal(); // Close modal after submission
    }


    displaySignInMessage() {
        this.showSignInMessage = true;
        setTimeout(() => {
            this.showSignInMessage = false;
        }, 3000);
    }

    closeModal() {
        this.showCommentModal = false;
        this.selectedRating = 0;
        this.userComment = '';
    }

    
     // Handle star selection
    selectRating(event) {
    const value = event.target.dataset.value;
    if (value) {
        this.selectedRating = parseInt(value, 10);
    } else {
        console.error('Invalid data-value:', value);
        this.selectedRating = 0;
    }
   }
   
     // Handle hovering over a star
    hoverRatingHandler(event) {
        const value = parseInt(event.currentTarget.dataset.value, 10);
        this.hoverRating = value;
    }

    // Clear hover rating when mouse leaves
    clearHoverRating() {
        this.hoverRating = 0;
    }


     // Handle comment change
    handleCommentChange(event) {
        this.userComment = event.target.value;
    }

    get likeButtonLabel() {
        return this.isLiked ? 'Liked' : 'Like';
    }

    get watchButtonLabel() {
        return this.isWatched ? 'Watched' : 'Watch Now';
    }

    resetStars() {
        // Initialize or reset stars before recalculating
        this.filledStars = [];
        this.emptyStars = [];
    }

    calculateStars() {
        // Calculate filled and empty stars
        const rating = this.movie.voteAverage / 2;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        this.filledStars = Array.from({ length: fullStars });
        this.emptyStars = Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) });
    }

    get formattedRating() {
        return (this.movie.voteAverage / 2).toFixed(1); // Format to 1 decimal place
     }
    
     get hasHalfStar() {
        const rating = this.movie.voteAverage / 2;
        return rating % 1 !== 0; // True if the decimal part is not zero
    }
}
