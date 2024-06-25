import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import userSlices from "./slices/userSlices";
import popupSlices from "./slices/popupSlices";

const rootPersistConfig = {
  key: "marketing-root",
  storage: storage,
  blacklist: ["error_send_data"],
};

const rootReducer = combineReducers({
  user: persistReducer(rootPersistConfig, userSlices),
  popup: popupSlices,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(thunk),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
