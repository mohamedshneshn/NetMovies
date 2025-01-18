import { LightningElement } from 'lwc';
import getWatchedMovies from '@salesforce/apex/TMDBService.fetchWatchedMovies';
export default class WatchedMovies extends LightningElement {

    movies = [];
     error;

    connectedCallback() {
        this.fetchWatchedMovies();
    }

    fetchWatchedMovies() {
        getWatchedMovies()
            .then((result) => {
                this.movies = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.movies = [];
            });
    }

}