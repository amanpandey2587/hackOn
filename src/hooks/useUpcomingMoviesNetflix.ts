import axios from "axios";
import { getUpcomingMovies, setUpcomingLoading, setError } from "../redux/movieSlice";
import { Upcoming_Movie, options } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../redux/store";

const useUpcomingMovies = () => {
    const dispatch = useDispatch();
    const { upcomingMovies, loading } = useSelector((state: RootState) => ({
        upcomingMovies: state.movie.upcomingMovies,
        loading: state.movie.loading?.upcoming || false
    }));
    
    useEffect(() => {
        // Only fetch if we don't have data and we're not already loading
        if (!upcomingMovies && !loading) {
            const fetchUpcomingMovies = async () => {
                dispatch(setUpcomingLoading(true));
                
                try {
                    const res = await axios.get(Upcoming_Movie, options);
                    dispatch(getUpcomingMovies(res.data.titles));
                } catch (error) {
                    console.log("Error fetching upcoming movies:", error);
                    dispatch(setError(`Failed to fetch upcoming movies: ${error}`));
                } finally {
                    dispatch(setUpcomingLoading(false));
                }
            };
            
            fetchUpcomingMovies();
        }
    }, []); // Empty dependency array - only run once on mount
};

export default useUpcomingMovies;