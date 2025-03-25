import { createSlice, configureStore } from "@reduxjs/toolkit";

const CONSTANTS = createSlice({
  name: "CONSTANTS",
  initialState: {
    ip: "http://localhost:4000",
  },
});

const USERDATA = createSlice({
  name: "USERDATA",
  initialState: {},
  reducers: {
    loadUserData(state, action) {
      return { ...action.payload };
    },
    // changeName(state, action) {
    //   state.name = action.payload;
    // },
    // changeImage(state, action) {
    //   state.image = action.payload;
    // },
    // changeAboutMe(state, action) {
    //   state.aboutMe = action.payload;
    // },
    // changeCoverImage(state, action) {
    //   state.coverImage = action.payload;
    // },
  },
});

const currentMainCont = createSlice({
  name: "currentMainCont",
  initialState: {
    value: "friendsCont",
    id: "",
    name: "",
  },
  reducers: {
    changeCont(state, action) {
      state.value = action.payload.value;
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
  },
});

const ContextMenu = createSlice({
  name: "contextMenu",
  initialState: {
    id: "",
  },

  reducers: {
    loadMenu(state, action) {
      return {
        id: action.payload,
      };
    },
  },
});

const spinner = createSlice({
  name: "spinner",
  initialState: false,
  reducers: {
    toggleSpinner(state, action) {
      return action.payload;
    },
  },
});

const notifications = createSlice({
  name: "notifications",
  initialState: {
    type: "",
    color: "", //green, red, yellow, normal
    message: "",
    ongoing: false,
  },
  reducers: {
    setNotification(state, action) {
      if (!state.ongoing) {
        return { ...action.payload, ongoing: true };
      }
    },
    closeNotifications(state, action) {
      if (state.ongoing) {
        return { type: "", message: "", ongoing: false };
      }
    },
  },
});

const cart = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    loadCart(state, action) {
      return action.payload;
    },
  },
});

const wishlist = createSlice({
  name: "wishlist",
  initialState: [],
  reducers: {
    loadWish(state, action) {
      return action.payload;
    },
  },
});

const address = createSlice({
  name: "address",
  initialState: [],
  reducers: {
    loadAddress(state, action) {
      return [...action.payload];
    },
  },
});

const saved = createSlice({
  name: "saved",
  initialState: [],
  reducers: {
    loadSaved(state, action) {
      return [...action.payload];
    },
  },
});

const categories = createSlice({
  name: "categories",
  initialState: {
    current: "",
    categories: [],
  },
  reducers: {
    loadCat(state, action) {
      return { current: "", categories: [...action.payload] };
    },
    setState(state, action) {
      console.log(action.payload);
      return { ...state, current: action.payload };
    },
  },
});

const store = configureStore({
  reducer: {
    USERDATA: USERDATA.reducer,
    currentMainCont: currentMainCont.reducer,
    CONSTANTS: CONSTANTS.reducer,
    contextMenu: ContextMenu.reducer,
    spinner: spinner.reducer,
    notifications: notifications.reducer,
    cart: cart.reducer,
    saved: saved.reducer,
    categories: categories.reducer,
    wishlist: wishlist.reducer,
  },
});

export const UserDataActions = USERDATA.actions;
export const CurrentMainContActions = currentMainCont.actions;
export const ConstantsActions = CONSTANTS.actions;
export const ContextMenuActions = ContextMenu.actions;
export const spinnerActions = spinner.actions;
export const notificationsAction = notifications.actions;
export const cartAction = cart.actions;
export const savedAction = saved.actions;
export const categoriesAction = categories.actions;
export const wishlistAction = wishlist.actions;
export const addressAction = address.actions;

export default store;
