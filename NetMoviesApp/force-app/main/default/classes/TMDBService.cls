public without sharing class TMDBService {

// Method to fetch the popular movies from Salesforce
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> fetchPopularMovies() {
        List<Movie__c> popularMovies = [
            SELECT Id, Title__c, Poster_Image__c, Popularity__c
            FROM Movie__c 
            WHERE Popularity__c != null
                    AND Language__c = 'English'
                    AND Poster_Image__c != null
                    
            ORDER BY Popularity__c DESC 
            LIMIT 15
        ];
        
        List<Map<String, Object>> movies = new List<Map<String, Object>>();
        for (Movie__c movie : popularMovies) {
            movies.add(new Map<String, Object>{
                'id' => movie.Id,
                'title' => movie.Title__c,
                'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.Poster_Image__c
            });
        }

        return movies;
    }

// Method to fetch the top rated movies from Salesforce
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> fetchTopRatedMovies() {
        List<Movie__c> topRatedMovies = [
            SELECT Id, Title__c, Poster_Image__c
            FROM Movie__c 
            WHERE Popularity__c != null
                    AND Language__c = 'English'
                    AND Poster_Image__c != null
            ORDER BY Rating_Sum__c DESC
            LIMIT 15
        ];

        List<Map<String, Object>> movies = new List<Map<String, Object>>();
        for (Movie__c movie : topRatedMovies) {
            movies.add(new Map<String, Object>{
                'id' => movie.Id,
                'title' => movie.Title__c,
                'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.Poster_Image__c
            });
        }

        return movies;
    }

// Method to fethc the recommende Movies from salesforce
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> fetchRecommendedMovies() {
        List<Movie__c> recommendedMovies = [
            SELECT Id, Title__c, Poster_Image__c
            FROM Movie__c 
            WHERE Popularity__c != null
                  AND Language__c = 'English'
                  AND Poster_Image__c != null
            ORDER BY Rating_Sum__c ASC
            LIMIT 15
        ];

        List<Map<String, Object>> movies = new List<Map<String, Object>>();
        for (Movie__c movie : recommendedMovies) {
            movies.add(new Map<String, Object>{
                'id' => movie.Id,
                'title' => movie.Title__c,
                'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.Poster_Image__c
            });
        }

        return movies;
    }

// Method to get the movie details from Salesforce
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getMovieDetails(ID movieId) {

        Movie__c movieDetails = [SELECT Description__c, Genre__c, Language__c, Popularity__c, 
                            Poster_Image__c, Production_Company__c, Production_Country__c, 
                            Release_Date__c, Tagline__c, Title__c, Vote_Average__c, Adult_Rating__c 
                            FROM Movie__c 
                            WHERE Id =: movieId];
        
        return new Map<String, Object>{
                'id' =>  (ID) movieDetails.Id,
                'title' => (String) movieDetails.Title__c,
                'overview' => (String) movieDetails.Description__c,
                'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movieDetails.Poster_Image__c,
                'releaseDate' => (Date) movieDetails.Release_Date__c,
                'voteAverage' => (Integer) movieDetails.Vote_Average__c,
                'genre' => (String) movieDetails.Genre__c,
                'language' => (String) movieDetails.Language__c,
                'popularity' => (Integer) movieDetails.Popularity__c,
                'productionCompany' => (String) movieDetails.Production_Company__c,
                'productionCountry' => (String) movieDetails.Production_Country__c,
                'tagline' => (String) movieDetails.Tagline__c,
                'adultRating' => (Boolean) movieDetails.Adult_Rating__c
        };
    }

// Method to search for movies from Salesforce
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> searchMovies(String searchTerm) {
        // Prepare the search term for a case-insensitive SOQL query
        String searchPattern = '%' + searchTerm + '%';

        // Query the Movie__c object
        List<Movie__c> matchedMovies = [
            SELECT Id, Title__c, Poster_Image__c, Release_Date__c
            FROM Movie__c
            WHERE Title__c LIKE :searchPattern
            ORDER BY Popularity__c DESC
            LIMIT 20
        ];

        // Initialize the movies list to store results
        List<Map<String, Object>> movies = new List<Map<String, Object>>();

        // Iterate through the matched records and format the response
        for (Movie__c movie : matchedMovies) {
            movies.add(new Map<String, Object>{
                'id' => movie.Id,
                'title' => movie.Title__c,
                'imageUrl' => movie.Poster_Image__c != null ? 'https://image.tmdb.org/t/p/w500' + movie.Poster_Image__c : null,
                'releaseDate' => movie.Release_Date__c != null ? String.valueOf(movie.Release_Date__c) : 'Unknown'
                
            });
        }

        return movies; // Return the list of movies
    }

// Method to get the related movies from Salesforce
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> fetchRelatedMovies(Id movieId) {
          
        // Fetch the main movie record
        Movie__c mainMovie = [
            SELECT Id, Title__c, Genre__c
            FROM Movie__c
            WHERE Id = :movieId
            LIMIT 1
        ];  
        
        // Fetch the related movies based on the genre
        List<Movie__c> relatedMovies = [
            SELECT Id, Title__c, Poster_Image__c
            FROM Movie__c
            WHERE Genre__c = :mainMovie.Genre__c
                    AND Id != :movieId
                    AND Poster_Image__c != null
            LIMIT 15
        ];

        // Initialize the movies list

        List<Map<String, Object>> movies = new List<Map<String, Object>>();
        for (Movie__c movie : relatedMovies) {
            movies.add(new Map<String, Object>{
                'id' => movie.Id,
                'title' => movie.Title__c,
                'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.Poster_Image__c
            });
        }

        return movies;            
    }


// Method to create a new user movie interaction record
 @AuraEnabled
public static void createUserMovieInteraction(Id movieId, Boolean watchStatus, String userComment, Integer userRating) {
    Id userId = UserInfo.getUserId();
    try {
        // Fetch the related Contact for the current User
        Contact userContact;
        List<Contact> contacts = [
            SELECT Id
            FROM Contact
            WHERE CreatedById = :userId
            LIMIT 1
        ];

        if (!contacts.isEmpty()) {
            userContact = contacts[0];
        } else {
            // Create a new Contact if none exists
            userContact = new Contact(
                FirstName = 'Guest',
                LastName = 'User',
                CreatedById = userId
            );
            insert userContact; // Save the new Contact
        }

        // Check if the user has already interacted with the movie
        Interaction_History__c existingInteraction;
        List<Interaction_History__c> interactionList = [
            SELECT Id, Watched__c, Comment__c, Movie_Rating__c
            FROM Interaction_History__c
            WHERE User__c = :userId
                AND Movie__c = :movieId
            LIMIT 1
        ];

        if (!interactionList.isEmpty()) {
            existingInteraction = interactionList[0];
        }

        if (existingInteraction == null) {
            // Create a new Interaction_History__c record
            Interaction_History__c newInteraction = new Interaction_History__c(
                User__c = userId,
                Movie__c = movieId,
                Watched__c = watchStatus,
                Comment__c = userComment,
                Movie_Rating__c = userRating,
                Contact__c = userContact.Id
            );
            insert newInteraction;
        } else {
            // Update the existing Interaction_History__c record
            if (watchStatus != null) existingInteraction.Watched__c = watchStatus;
            if (userComment != null) existingInteraction.Comment__c = userComment;
            if (userRating != null) existingInteraction.Movie_Rating__c = userRating;
            update existingInteraction;
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error updating user movie interaction: ' + e.getMessage());
    }
}




// Method to get the watched movie list from the interaction history
    @AuraEnabled(cacheable=false)
    public static List<Map<String, Object>> fetchWatchedMovies() {
        List<Map<String, Object>> watchedMovies = new List<Map<String, Object>>();
        Id userId = UserInfo.getUserId();

        // Fetch the watched movies from the Interaction_History__c object
        List<Interaction_History__c> interactions = [
            SELECT Id, Movie__r.Id, Movie__r.Title__c, Movie__r.Poster_Image__c
            FROM Interaction_History__c
            WHERE User__c = :userId
                AND Watched__c = true
        ];

        // Iterate through the interaction records and format the response
        for (Interaction_History__c interaction : interactions) {
            watchedMovies.add(new Map<String, Object>{
                'id' => interaction.Movie__r.Id,
                'title' => interaction.Movie__r.Title__c,
                'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) interaction.Movie__r.Poster_Image__c
            });
        }

        return watchedMovies; // Return the list of watched movies
    }



// Method to check if the user is logged in
    @AuraEnabled(cacheable=true) 
    public static Boolean isUserLoggedIn() {

            // Check if the user is the Guest User
            return UserInfo.getUserType() != 'Guest';    
    } 
        
// Method to get the user details
    @AuraEnabled(cacheable=true)
    public static String getUserDetails(Id userId) {

            User user = [SELECT FirstName FROM User WHERE Id = :userId LIMIT 1];
            return user.FirstName;
    }





//  Method to fetch the popular movies using TMDB API
//     @AuraEnabled(cacheable=true)
//     public static List<Map<String, Object>> fetchPopularMovies() {
//         // Make HTTP Callout
//         Http http = new Http();
//         HttpRequest request = new HttpRequest();
//         request.setEndpoint('https://api.themoviedb.org/3/movie/popular?api_key=3cc5bd92f156f2667072ee6e1970d4a3');
//         request.setMethod('GET');
        
//         HttpResponse response = http.send(request);
        
//         // Check for a valid response
//         if (response.getStatusCode() == 200) {
//             Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
//             List<Object> results = (List<Object>) responseBody.get('results');
            
//             // Initialize the movies list
//             List<Map<String, Object>> movies = new List<Map<String, Object>>();
            
//             for (Object obj : results) {
//                 Map<String, Object> movie = (Map<String, Object>) obj;
//                 movies.add(new Map<String, Object>{
//                     'id' =>  movie.get('id'),
//                     'title' => (String) movie.get('title'),
//                     'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.get('poster_path')

//                 });
//             }
//             return movies;
//         } else {
//             return new List<Map<String, Object>>(); // Return an empty list if the response is invalid
//         }
//    }

//  Method to get the top rated movies using TMDB API
//     @AuraEnabled(cacheable=true)
//     public static List<Map<String, Object>> fetchTopRatedMovies(){
//         // Make HTTP Callout
//         Http http = new Http();
//         HttpRequest request = new HttpRequest();
//         request.setEndpoint('https://api.themoviedb.org/3/movie/top_rated?api_key=3cc5bd92f156f2667072ee6e1970d4a3');
//         request.setMethod('GET');

//         HttpResponse response = http.send(request);

//         // Check for a valid response
//         if (response.getStatusCode() == 200) {
//             Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
//             List<Object> results = (List<Object>) responseBody.get('results');

//             // Initialize the movies list
//             List<Map<String, Object>> movies = new List<Map<String, Object>>();

//             for (Object obj : results) {
//                 Map<String, Object> movie = (Map<String, Object>) obj;
//                 movies.add(new Map<String, Object>{
//                         'id' =>  movie.get('id'),
//                     'title' => (String) movie.get('title'),
//                     'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.get('poster_path')
//                 });
//             }
//             return movies;
//         } else {
//             return new List<Map<String, Object>>(); // Return an empty list if the response is invalid
//         }
//   }

// Method to get the movie details using TMDB API
    // @AuraEnabled(cacheable=true)
    // public static Map<String, Object> getMovieDetails(Integer movieId) {
    //     // Make HTTP Callout
    //     Http http = new Http();
    //     HttpRequest request = new HttpRequest();
    //     request.setEndpoint('https://api.themoviedb.org/3/movie/' + movieId + '?api_key=3cc5bd92f156f2667072ee6e1970d4a3');
    //     request.setMethod('GET');

    //     HttpResponse response = http.send(request);

    //     // Check for a valid response
    //     if (response.getStatusCode() == 200) {
    //         Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
    //         return new Map<String, Object>{
    //             'id' =>  responseBody.get('id'),
    //             'title' => (String) responseBody.get('title'),
    //             'overview' => (String) responseBody.get('overview'),
    //             'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) responseBody.get('poster_path'),
    //             'releaseDate' => (String) responseBody.get('release_date'),
    //             'voteAverage' => (Decimal) responseBody.get('vote_average')
    //         };
                
        
    //     } else {
    //         return null; // Return null if the response is invalid
    //     }
    // }


// Method to search for movies using TMDB API
    // @AuraEnabled(cacheable=true)
    // public static List<Map<String, Object>> searchMovies(String searchTerm) {
    //     // Prepare query parameters
    //     searchTerm = '%' + searchTerm + '%';

    //     // Make HTTP Callout
    //     Http http = new Http();
    //     HttpRequest request = new HttpRequest();
    //     request.setEndpoint('https://api.themoviedb.org/3/search/movie?api_key=3cc5bd92f156f2667072ee6e1970d4a3&query=' + EncodingUtil.urlEncode(searchTerm, 'UTF-8'));
    //     request.setMethod('GET');

    //     HttpResponse response = http.send(request);

    //     // Check for a valid response
    //     if (response.getStatusCode() == 200) {
    //         // Deserialize the response body into a Map
    //         Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
    //         List<Object> results = (List<Object>) responseBody.get('results');

    //         // Initialize the movies list
    //         List<Map<String, Object>> movies = new List<Map<String, Object>>();

    //         for (Object obj : results) {
    //             Map<String, Object> movie = (Map<String, Object>) obj;
    //             movies.add(new Map<String, Object>{
    //                 'id' => movie.get('id'),
    //                 'title' => (String) movie.get('title'),
    //                 'imageUrl' => 'https://image.tmdb.org/t/p/w500' + (String) movie.get('poster_path'),
    //                 'releaseDate' => (String) movie.get('release_date'),
    //                 'voteAverage' => (Decimal) movie.get('vote_average')
    //             });
    //         }

    //         return movies;
    //     } else {
    //         return new List<Map<String, Object>>(); // Return an empty list if the response is invalid
    //     }
    // }



}

