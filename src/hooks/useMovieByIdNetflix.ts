import axios from "axios";
import { options, WATCHMODE_API_KEY, WATCHMODE_BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { getTrailerMovie, setError } from "../redux/movieSlice";
import { useEffect } from "react";
import type { RootState } from "../redux/store";

const useMovieById = (movieId: string) => {
    const dispatch = useDispatch();
    // const { trailerMovie, loading } = useSelector((state: RootState) => ({
    //     trailerMovie: state.movie.trailerMovie,
    //     loading: state.movie.loading? || false
    // }));
    
    useEffect(() => {
        // Only fetch if we have a movieId and don't already have data for this movie
        if (movieId ) {
            const getMovieById = async () => {
                // dispatch(setTrailerLoading(true));
                
                try {
                    const res = await axios.get(
                        `${WATCHMODE_BASE_URL}/title/${movieId}/details/?apiKey=${WATCHMODE_API_KEY}&append_to_response=sources`,
                        options
                    );
                    
                    const trailer = res.data?.results?.filter((item: any) => {
                        return item.type === "Trailer";
                    });
                    
                    dispatch(getTrailerMovie(trailer.length > 0 ? trailer[0] : res.data.results[0]));
                } catch (error) {
                    console.log("Error fetching movie by ID:", error);
                    dispatch(setError(`Failed to fetch movie details: ${error}`));
                } finally {
                    // dispatch(setTrailerLoading(false));
                }
            };
            
            getMovieById();
        }
    }, [movieId, dispatch]); // Only re-run if movieId changes
};

export default useMovieById;