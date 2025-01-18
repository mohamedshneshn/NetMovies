import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import searchMovies from '@salesforce/apex/TMDBService.searchMovies';

export default class SearchResults extends LightningElement {
    searchItem;
    movies = {};

    // Use CurrentPageReference to watch for URL changes
    @wire(CurrentPageReference)
    pageReference({ state }) {
        if (state && state.searchTerm) {
            const newSearchTerm = state.searchTerm;
            if (newSearchTerm !== this.searchItem) {
                this.searchItem = newSearchTerm;
                this.fetchMovies(); // Re-fetch movies when search term changes
            }
        }
    }

    fetchMovies() {
        searchMovies({ searchTerm: this.searchItem })
            .then((data) => {
                this.movies = data;
            })
            .catch((error) => {
                console.error('Error fetching movie details:', error);
            });
    }
}
