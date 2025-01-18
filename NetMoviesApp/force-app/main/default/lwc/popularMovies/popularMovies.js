import { LightningElement, wire } from 'lwc';
import fetchPopularMovies from '@salesforce/apex/TMDBService.fetchPopularMovies';

export default class PopularMovies extends LightningElement {
    movies = [];

    @wire(fetchPopularMovies)
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
