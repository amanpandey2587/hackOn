import axios from "axios";
import { getNowPlayingMovies, setNowPlayingLoading, setError } from "../redux/movieSlice";
import { Now_Playing_Movie, options } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../redux/store";

const useNowPlayingMovies = () => {
    const dispatch = useDispatch();
    const { nowPlayingMovies, loading } = useSelector((state: RootState) => ({
        nowPlayingMovies: state.movie.nowPlayingMovies,
        loading: state.movie.loading?.nowPlaying || false
    }));
    
    useEffect(() => {
        // Only fetch if we don't have data and we're not already loading
        if (!nowPlayingMovies && !loading) {
            const fetchNowPlayingMovies = async () => {
                dispatch(setNowPlayingLoading(true));
                
                try {
                    const res = await axios.get(Now_Playing_Movie, options);
                    dispatch(getNowPlayingMovies(res.data.titles));
                } catch (error) {
                    console.log("Error fetching now playing movies:", error);
                    dispatch(setError(`Failed to fetch now playing movies: ${error}`));
                } finally {
                    dispatch(setNowPlayingLoading(false));
                }
            };
            
            fetchNowPlayingMovies();
        }
    }, []); // Empty dependency array - only run once on mount
};

export default useNowPlayingMovies;