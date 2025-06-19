import Stream from '../components/home/Stream'
import Navbar from '../components/Navbar'
import StreamingShowcase from '../components/home/StreamingShowcase'
import StreamingPlatform from '../components/StreamingPlatform'
import WatchMovies from '../components/WatchMovies'
import Karaoke_Mode from '../components/Karaoke_Mode'
import BrowseGenre from '@/components/home/BrowserGenre'
const Home = () => {
  return (
    <div className=''>
      <Stream/>
      <div className=''>
      <Navbar/>
      </div>
      {/* <StreamingShowcase/> */}
      {/* <Karaoke_Mode/> */}
      <BrowseGenre/>
      {/* <StreamingPlatform/> */}
      {/* <WatchMovies/> */}
    </div>
  )
}

export default Home
