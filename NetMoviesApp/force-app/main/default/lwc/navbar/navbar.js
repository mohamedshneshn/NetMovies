import { LightningElement, track } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import isUserLoggedIn from '@salesforce/apex/TMDBService.isUserLoggedIn';

import userId from '@salesforce/user/Id';
import getUserDetails from '@salesforce/apex/TMDBService.getUserDetails';

export default class  Navbar extends NavigationMixin(LightningElement) {
    
    @track isLoggedIn = false; // Tracks user login state
    @track loggedInUserName = '';
    
    connectedCallback() {
        this.checkUserLogin();
    }


    checkUserLogin() {
        console.log('Checking user login state...');
        isUserLoggedIn()
            .then(result => {
                this.isLoggedIn = result;
                console.log('User login state:', this.isLoggedIn);
                 if (this.isLoggedIn) {
                    this.fetchLoggedInUserName();
                }
            }
        )
            .catch(error => {
                console.error('Error fetching user login state:', error);
            }
        );
    }


    fetchLoggedInUserName() {
        if (userId) {
            getUserDetails({ userId: userId })
                .then(result => {
                    this.loggedInUserName = result;
                    console.log('Logged-in user name:', this.loggedInUserName);
                })
                .catch(error => {
                    console.error('Error fetching logged-in user name:', error);
                });
        }
    }


    handleLogout() {

        this.isLoggedIn = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/secur/logout.jsp?startURL=/'
            }
        });
    }

   
    handleSearchInput(event) {
    const searchTerm = event.target.value;
    if (searchTerm.length > 0) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/search?searchTerm=${searchTerm}`
            }
        });
    }
}

   

    handleMenuToggle() {
        const navMenu = this.template.querySelector('[id^="navbarNav"]');
        if (navMenu) {
            // Toggle `show` class
            navMenu.classList.toggle('show');
        }else{
            console.log('navMenu not found');
        }
    }

    navigateToRegister() {
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: `/SelfRegister`
            }
        });
    }

    navigateToHome() {
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: `/`
            }
        });
    }

    navigateToSignIn() {
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: `/login`
            }
        });
    }

    handleWatchedMovies() {
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: `/watched-movies`
            }
        });
    }
    



   
}
