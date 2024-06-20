import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface PopUpState {
  isOpen: boolean;
  background: "image" | "white";
  content: React.ReactNode | null;
  height: number;
}

// Define the initial state
const initialState: PopUpState = {
  isOpen: false,
  content: null,
  background: "white",
  height: 60,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    toggleImagePopup: (state: any, action: PayloadAction<React.ReactNode>) => {
      state.isOpen = !state.isOpen;
      state.content = action.payload;
      state.background = "image";
      state.height = 60;
    },
    toggleWhitePopup: (state: any, action: PayloadAction<React.ReactNode>) => {
      state.isOpen = !state.isOpen;
      state.content = action.payload;
      state.background = "white";
      state.height = 80;
    },
    closePopup: (state: any) => {
      state.isOpen = false;
      state.content = null;
    },
  },
});

//Reducers
export const { toggleImagePopup, toggleWhitePopup, closePopup } =
  popupSlice.actions;
export const getClosePopup = (state: { popup: { isOpen: boolean } }) =>
  state.popup?.isOpen;
// reducer
export default popupSlice.reducer;
