import MovieList from './MovieList';
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

interface Movie {
    id: string;
    title: string;
    overview: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    vote_average?: number;
    genre_names:string[],
    runtime_minutes?:number;
}

// Define props interface
interface MovieContainerProps {
    nowPlayingMovies: Movie[];
    popularMovies: Movie[];
    topRatedMovies: Movie[];
    upcomingMovies: Movie[];
}

const MovieContainer = ({ 
    nowPlayingMovies, 
    popularMovies, 
    topRatedMovies, 
    upcomingMovies 
}: MovieContainerProps) => {
    const loading = useSelector((store: RootState) => store.movie.loading);
    
    // console.log("Movies passed as props:", { 
    //     nowPlayingMovies, 
    //     popularMovies, 
    //     topRatedMovies, 
    //     upcomingMovies 
    // });
    
    return (
        <div className='bg-black relative'>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>
            
            <div className='relative z-10 pb-12'>
                <div className="mb-8">
                    <MovieList 
                        title={"Popular Movies"}
                        movies={popularMovies}
                        isLoading={loading?.popular || false}
                    />
                </div>
                
                <div className="mb-8">
                    <MovieList 
                        title={"Now Playing Movies"}
                        movies={nowPlayingMovies}
                        isLoading={loading?.nowPlaying || false}
                    />
                </div>
                
                <div className="mb-8">
                    <MovieList 
                        title={"Top Rated Movies"}
                        movies={topRatedMovies}
                        isLoading={loading?.topRated || false}
                    />
                </div>
                
                <div className="mb-8">
                    <MovieList 
                        title={"Upcoming Movies"}
                        movies={upcomingMovies}
                        isLoading={loading?.upcoming || false}
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieContainer;