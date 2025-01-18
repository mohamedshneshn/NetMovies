import { LightningElement, wire } from 'lwc';
import fetchTopRatedMovies from '@salesforce/apex/TMDBService.fetchTopRatedMovies';

export default class TopRatedMovies extends LightningElement {

     movies = [];

    @wire(fetchTopRatedMovies)
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