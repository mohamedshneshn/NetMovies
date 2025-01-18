import { LightningElement, api  ,wire} from 'lwc';
// import { publish, MessageContext } from 'lightning/messageService';
// import MOVIE_MESSAGE_CHANNEL from '@salesforce/messageChannel/MovieMessageChannel__c';
import { NavigationMixin } from 'lightning/navigation';

export default class MovieCard extends NavigationMixin(LightningElement) {
    @api movie;

  
    // @wire(MessageContext)
    // messageContext;

        

    handleMovieClick() {
        const movieId = this.movie.id;

        // Navigate to the new movie detail page
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/moviedetail?movieId=${movieId}`
            }
        }, true); // true pushes the new state to the browser history
    }
        
    
}



