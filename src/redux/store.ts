import { configureStore } from "@reduxjs/toolkit";
import  userReducer  from "./userSlice";
import movieReducer from './movieSlice'
import searchSlice from "./searchSlice"
import mainContentReducer from "./mainContentSlice"

const store=configureStore({
    reducer:{
        app:userReducer,
        movie:movieReducer,
        searchMovie:searchSlice,
        mainContent:mainContentReducer
    }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export  {store}
