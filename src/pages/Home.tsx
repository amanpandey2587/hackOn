import Stream from '../components/home/Stream'
import Navbar from '../components/Navbar'
import StreamingShowcase from '../components/home/StreamingShowcase'
import StreamingPlatform from '../components/StreamingPlatform'
// import WatchMovies from '../components/WatchMovies'
import Karaoke_Mode from '../components/Karaoke_Mode'
import BrowseGenre from '@/components/home/BrowserGenre'
import AudioRecorder from '@/components/Search/AudioStreamer'
import SearchBar from '@/components/Search/SearchBar'
const Home = () => {
  return (
    <div className=''>
      <Stream/>
      <div className=''>
      <Navbar/>
      </div>
      <BrowseGenre/>
      {/* <AudioRecorder/> */}
      {/* <SearchBar/> */}
    </div>
  )
}

export default Home
