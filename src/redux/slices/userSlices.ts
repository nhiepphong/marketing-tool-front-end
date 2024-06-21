import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUserByAPI } from "../../api/authentication";
import { ValuePropsGetUser, DataUser } from "../../utils/interface.global";
import { showToast } from "../../utils/showToast";

//"user/login"
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    { email, password }: ValuePropsGetUser,
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const props = {
        email,
        password,
      };
      const response = await loginUserByAPI(props);
      console.log("loginUser", response);
      const message = response.data.message || response.message;

      if (response.status == 200) {
        showToast({ message: message, type: "success" });
        //console.log("fulfillWithValue", response);
        return fulfillWithValue(response.data.data);
      } else {
        console.log("message", message);
        showToast({
          type: "error",
          message: message,
        });
        throw rejectWithValue(message);
      }
    } catch (error) {
      throw rejectWithValue(
        (error as DOMException).message + "-" + new Date().getTime()
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    status: false,
    userData: null,
    error: "",
  },
  reducers: {
    updateData: (state: any, action: any) => {
      const tmp = action.payload;
      if (tmp !== null) {
        state.userData = tmp;
        state.status = true;
      } else {
        state.userData = tmp;
        state.status = true;
      }
    },
    logout: (state: any) => {
      state.userData = null;
      state.status = false;
    },
  },
  extraReducers(builder) {
    builder
      // register user
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = true;
        state.userData = action.payload;
        //console.log("loginUser", action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = false;
        state.userData = null;
        state.error = action.payload as string;
        console.log("rejected", state.error);
      });
  },
});

//Reducers
export const { logout, updateData } = userSlice.actions;

// actions
//export const getUserData = (state) => state.user?.userData;
export const getUserData = (state: { user: { userData: DataUser } }) =>
  state.user?.userData;
export const getUserStatus = (state: { user: { status: string } }) =>
  state.user?.status;
export const getUsertErr = (state: { user: { error: string } }) =>
  state.user?.error;

// reducer
export default userSlice.reducer;
