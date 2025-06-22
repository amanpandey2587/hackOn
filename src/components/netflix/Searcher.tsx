import React from 'react'
import NetflixSearch from '../Search/NetflixSearch'
import NetflixStreamer from '../Search/NetflixStreamer'
import { useState } from 'react'
const Searcher = () => {
    const [voiceQuery, setVoiceQuery] = useState(''); 

    const handleTranscription = (transcription: string) => {
      setVoiceQuery(transcription);
    };
  return (
    <div>
      
    </div>
  )
}

export default Searcher
