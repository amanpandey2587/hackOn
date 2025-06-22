import Stream from "../components/home/Stream";
import Navbar from "../components/Navbar";
import StreamingShowcase from "../components/home/StreamingShowcase";
import StreamingPlatform from "../components/StreamingPlatform";
import Karaoke_Mode from "../components/Karaoke_Mode";
import BrowseGenre from "@/components/home/BrowserGenre";
import AudioRecorder from "@/components/Search/AudioStreamer";
import SearchBar from "@/components/Search/SearchBar";
import MusicSeparator from "@/components/Search/MusicSeparator";
import RecommendationBar from "@/components/home/RecommendationBar"; // Add this import
import KaraokeApp from "../components/Karaoke_Mode";
import WatchlistApp from "@/components/WatchlistProps/WatchListApp";
const Home = () => {
  return (
    <div className="">
      <Stream/>
      <div className="">
        <Navbar />
      </div>
      {/* Add the recommendation bar here */}
       <BrowseGenre/>
      {/* <MusicSeparator/>  */}
      {/* <KaraokeApp/> */}
      {/* <WatchlistApp/> */}
      <RecommendationBar />
    </div>
  );
};

export default Home;
