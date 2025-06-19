export const API_END_POINT = "http://localhost:8080/api/v1/user";

export const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer gLylpq6dawLhi00PHcnXP0ZZ3rBdEiIB3q35FDNY'
    }
  };
  export const watchmode_options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
    }
};

export const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";


export const WATCHMODE_API_KEY = "5IuepmguYwWWqFbgZI40c6dcv4iEAvhwBKGI85zH";
export const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";

// Netflix Section - ACTUAL Netflix content only (source_ids=203 is Netflix)
export const Now_Playing_Movie = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=203&types=movie&sort_by=release_date_desc&limit=20`;
export const Popular_Movie = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=203&types=movie&sort_by=popularity_desc&limit=20`;
export const Top_Rated_Movie = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=203&types=movie&sort_by=popularity_asc&limit=20`;
export const Upcoming_Movie = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=203&types=tv_series&sort_by=popularity_desc&limit=20`;
export const Netflix_TV_Shows = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=203&types=tv_series&sort_by=popularity_desc&limit=20`;
export const SEARCH_MOVIE_URL = `${WATCHMODE_BASE_URL}/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=`;

// Prime Video Section - ACTUAL Prime Video content only (source_ids=26 is Prime Video)
export const Prime_Latest_Movies = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=26&types=movie&sort_by=release_date_desc&limit=20`;
export const Prime_Popular_Content = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=26&sort_by=popularity_desc&limit=20`;
export const Prime_Top_Rated_Shows = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=26&types=tv_series&sort_by=rating_desc&limit=20`;
export const Prime_Original_Series = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=26&types=tv_series&sort_by=popularity_desc&limit=20`;
export const Prime_Action_Movies = `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&source_ids=26&types=movie&genres=1&sort_by=popularity_desc&limit=20`; // Genre 1 = Action
export const SEARCH_PRIME_CONTENT = `${WATCHMODE_BASE_URL}/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=`;
