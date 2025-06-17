import Stream from '../components/home/Stream'
import Navbar from '../components/Navbar'
import StreamingShowcase from '../components/home/StreamingShowcase'
import StreamingPlatform from '../components/StreamingPlatform'
import WatchMovies from '../components/WatchMovies'
const Home = () => {
  return (
    <div className=''>
      <Stream/>
      <div className=''>
      <Navbar/>
      </div>
      <StreamingShowcase/>
      {/* <StreamingPlatform/> */}
      {/* <WatchMovies/> */}
    </div>
  )
}

export default Home
