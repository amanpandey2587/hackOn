
import { configureStore } from '@reduxjs/toolkit';
import mainContentReducer from './mainContentSlice';
import userReducer from "./userSlice"
import movieReducer from './movieSlice'
import searchSlice from "./searchSlice"
import netflixTVReducer from './netflixTVSlice'


export const store = configureStore({
  reducer: {
    mainContent: mainContentReducer,
    app:userReducer,
    movie:movieReducer,
    searchMovie:searchSlice,
    netflixTV:netflixTVReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import {  useDispatch, useSelector } from 'react-redux';
import type { } from '@reduxjs/toolkit';

export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;