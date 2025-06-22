import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ChatProvider } from './utils/ChatContextProvider.tsx'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { Provider } from 'react-redux'
import {store} from './redux/store.ts'
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
  
    
  <Provider store={store}>
    <ChatProvider>
      <App />
      </ChatProvider>
    </Provider>
   
  
  </ClerkProvider>,
)
