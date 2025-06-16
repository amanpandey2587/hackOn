import axios from "axios";
import { getTopRatedMovies, setTopRatedLoading, setError } from "../redux/movieSlice";
import { Top_Rated_Movie, options } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../redux/store";

const useTopRatedMovies = () => {
    const dispatch = useDispatch();
    const { topRatedMovies, loading } = useSelector((state: RootState) => ({
        topRatedMovies: state.movie.topRatedMovies,
        loading: state.movie.loading?.topRated || false
    }));
    
    useEffect(() => {
        // Only fetch if we don't have data and we're not already loading
        if (!topRatedMovies && !loading) {
            const fetchTopRatedMovies = async () => {
                dispatch(setTopRatedLoading(true));
                
                try {
                    const res = await axios.get(Top_Rated_Movie, options);
                    dispatch(getTopRatedMovies(res.data.titles));
                } catch (error) {
                    console.log("Error fetching top rated movies:", error);
                    dispatch(setError(`Failed to fetch top rated movies: ${error}`));
                } finally {
                    dispatch(setTopRatedLoading(false));
                }
            };
            
            fetchTopRatedMovies();
        }
    }, []); // Empty dependency array - only run once on mount
};

export default useTopRatedMovies;