import axios from "axios";
import { Popular_Movie, options } from "../utils/constant";
import { getPopularMovies, setPopularLoading, setError } from "../redux/movieSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../redux/store";

const usePopularMovies = () => {
    const dispatch = useDispatch();
    const { popularMovies, loading } = useSelector((state: RootState) => ({
        popularMovies: state.movie.popularMovies,
        loading: state.movie.loading?.popular || false
    }));
    
    useEffect(() => {
        // Only fetch if we don't have data and we're not already loading
        if (!popularMovies && !loading) {
            const fetchPopularMovies = async () => {
                dispatch(setPopularLoading(true));
                
                try {
                    const res = await axios.get(Popular_Movie, options);
                    dispatch(getPopularMovies(res.data.titles));
                    // console.log("Enterign the function of get popular movies ",res)
                } catch (error) {
                    console.log("Error fetching popular movies:", error);
                    dispatch(setError(`Failed to fetch popular movies: ${error}`));
                } finally {
                    dispatch(setPopularLoading(false));
                }
            };
            
            fetchPopularMovies();
        }
    }, []); // Empty dependency array - only run once on mount
};

export default usePopularMovies;