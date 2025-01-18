import { LightningElement, wire } from 'lwc';
import fetchRecommendedMovies from '@salesforce/apex/TMDBService.fetchRecommendedMovies';
export default class RecommendedMovies extends LightningElement {
    movies = [];

    @wire(fetchRecommendedMovies)
    wiredMovies({ error, data }) {
        if (data) {
            this.movies = data.map(movie => ({
                id: movie.id,
                title: movie.title,
                imageUrl: movie.imageUrl
            }));
        } else if (error) {
            console.error(error);
        }
    }
}
