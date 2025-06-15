import React from 'react';
import AppIcon from './AppIcon'

interface AppLauncherProps{
    onAppSelect:(app:'netflix' | 'prime' |'hulu')=>void;
}

const AppLauncher:React.FC<AppLauncherProps>=({onAppSelect})=>{
    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center'>
            <div className='text-center'>
                <h1 className='text-white text-4xl font-bold mb-4'>Streaming Apps</h1>
                <p className='text-gray-400 text-lg mb-12'>Choose your platform</p>
                <div className='flex space-x-12 justify-center items-center'>
                    <AppIcon platform='netflix' onClick={()=>onAppSelect('netflix')} />
                    <AppIcon platform='prime' onClick={()=>onAppSelect('prime')} />
                    <AppIcon platform='hulu' onClick={()=>onAppSelect('hulu')} />
                </div>
            </div>
        </div>
    )
}

export default AppLauncher