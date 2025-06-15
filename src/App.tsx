import React,{useState,useEffect} from 'react'
import Netflix from './components/Netflix'
import Prime from './components/Prime'
import Hulu from './components/Hulu'
import AppLauncher from './components/AppLauncher'
function App() {
  const [currentApp,setCurrentApp]=useState<'launcher'|'netflix'|'prime'|'hulu'>('launcher');
  useEffect(()=>{
    if(currentApp!=='launcher'){
      document.body.style.overflow='hidden';
    }else{
      document.body.style.overflow='auto'
    }
    return ()=>{
      document.body.style.overflow='auto'
    }
  },[currentApp])

  const renderCurrentApp=()=>{
    switch(currentApp){
      case 'netflix':
        return <Netflix/>;
      case 'prime':
        return <Prime/>
      case 'hulu':
        return <Hulu/>
      default:
        return <AppLauncher onAppSelect={setCurrentApp}/>
    }
  }

  return (
   <div className='relative'>
      {renderCurrentApp()}
      {currentApp!=='launcher' && (
        <button onClick={()=>setCurrentApp('launcher')}
        className='fixed top-4 right-4 z-50 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200 text-xl font-bold'
        >x</button>
      )}
   </div>
  )
}

export default App
