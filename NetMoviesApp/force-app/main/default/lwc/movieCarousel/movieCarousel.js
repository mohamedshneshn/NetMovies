import { LightningElement, api, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

// Swiper CDN URLs
const SWIPER_CSS_URL = 'https://unpkg.com/swiper/swiper-bundle.min.css';
const SWIPER_JS_URL = 'https://unpkg.com/swiper/swiper-bundle.min.js';

export default class MovieCarousel extends LightningElement {
    @api movies = [];
    @track swiperInstance;

    connectedCallback() {
        // Dynamically load Swiper CSS & JS
        Promise.all([
            loadStyle(this, SWIPER_CSS_URL),
            loadScript(this, SWIPER_JS_URL)
        ])
            .then(() => {
                this.initializeSwiper();
            })
            .catch(error => console.error('Failed to load Swiper resources', error));
    }

    initializeSwiper() {
        // Wait until DOM is ready and initialize Swiper.js with navigation settings
        this.swiperInstance = new Swiper(
            this.template.querySelector('.swiper-container'),
            {
                slidesPerView: 4, // Show 4 movies at a time
                spaceBetween: 10, // Space between slides in pixels
                // Enable looping through slides
                navigation: {
                     nextEl: this.template.querySelector('.swiper-button-next'),
                     prevEl: this.template.querySelector('.swiper-button-prev')
                },
                breakpoints: {
                    320: {
                        slidesPerView: 2,
                        spaceBetween: 10
                    },
                    640: {
                        slidesPerView: 3,
                        spaceBetween: 10
                    },
                    768: {
                        slidesPerView: 4,
                        spaceBetween: 10
                    },
                    1024: {
                        slidesPerView: 6,
                        spaceBetween: 10
                    }
                }
            }
        );
    }

    renderedCallback() {
        if (this.swiperInstance) {
            this.swiperInstance.update();
        }
    }
}
