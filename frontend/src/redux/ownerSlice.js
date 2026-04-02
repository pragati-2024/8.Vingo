import { createSlice } from "@reduxjs/toolkit";

const ownerSlice=createSlice({
    name:"owner",
    initialState:{
        myShops: [],
        activeShop: null
    },
    reducers:{
        setMyShops:(state,action)=>{
            state.myShops = action.payload;
            if (action.payload.length > 0 && !state.activeShop) {
                state.activeShop = action.payload[0];
            }
        },
        setActiveShop:(state,action)=>{
            state.activeShop = action.payload;
        }
    }
})

export const {setMyShops, setActiveShop}=ownerSlice.actions
export default ownerSlice.reducer