import React, { useState } from 'react'

const SearchBar = ({ onSearch }: { onSearch: (userId: string, service: string) => void }) => {
  const [userId, setUserId] = useState('')
  const [service, setService] = useState('Netflix')

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter User ID"
        className="px-4 py-2 text-black rounded"
      />
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="px-4 py-2 text-black rounded"
      >
        <option>Netflix</option>
        <option>Hulu</option>
        <option>Amazon Prime</option>
      </select>
      <button
        onClick={() => onSearch(userId, service)}
        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      >
        🎬 Get Recommendations
      </button>
    </div>
  )
}

export default SearchBar
