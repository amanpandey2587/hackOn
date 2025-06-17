import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    imageUrl: ''
}

const userSlice = createSlice({
    name:"user",
    initialState:{
        user:null,
        isLoading:false
    },
    reducers:{
        setUser: (state, action) => {
            return { ...state, ...action.payload }
        },
        setLoading:(state,action)=>{
            state.isLoading = action.payload;
        }
    }
});
export const {setUser,setLoading} = userSlice.actions;
export default userSlice.reducer;





