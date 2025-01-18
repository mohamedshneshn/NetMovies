import { LightningElement, track } from 'lwc';
import getRelatedMovies from '@salesforce/apex/TMDBService.fetchRelatedMovies';
export default class RelatededMovies extends LightningElement {
    @track movieId;
    movies = [];

    connectedCallback() {
         this.updateMovieIdFromUrl();
     
        this.fetchRelatedMovies();

        this.startUrlObserver();
       
    }
        disconnectedCallback() {
        // Cleanup observer
        this.stopUrlObserver();
    }

    handleUrlChange() {
        this.updateMovieIdFromUrl();
        this.fetchRelatedMovies();
    }

    updateMovieIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const newMovieId = urlParams.get('movieId');

        if (newMovieId !== this.movieId) {
            this.movieId = newMovieId;
            this.fetchRelatedMovies();
        }
       
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
 


    fetchRelatedMovies() {
        getRelatedMovies({ movieId: this.movieId })
            .then((data) => {
          
                this.movies = data;
            })
            .catch((error) => {
                console.error('Error fetching related movies:');
            });
    }
}