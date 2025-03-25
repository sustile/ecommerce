import "./App.css";
import { Route, Routes } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import ProductSearch from "./Components/ProductSearch/ProductSearch";
import Cart from "./Components/Cart/Cart";
import Checkout from "./Components/Cart/Checkout/Checkout";
import Account from "./Components/Account/Account";
import Login from "./LoginRegister/Login";
import Register from "./LoginRegister/Register";
import ProductPage from "./ProductPage/ProductPage";
import Home from "./Home/Home";
import { useSelector } from "react-redux";
import NotificationBar from "./Components/NotificationBar/NotificationBar";
import { AnimatePresence } from "framer-motion";

function App() {
  const notifications = useSelector((state) => state.notifications);
  return (
    <div className="App">
      <Routes>
        <Route
          path="/home"
          element={
            <>
              <Nav />
              <Home />
            </>
          }
        />
        <Route
          path="/shop"
          element={
            <>
              <Nav />
              <ProductSearch />
            </>
          }
        />
        <Route
          path="/product"
          element={
            <>
              <Nav />
              <ProductPage />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              <Nav />
              <Cart />
            </>
          }
        />
        <Route
          path="/checkout"
          element={
            <>
              <Nav type={"checkout"} />
              <Checkout />
            </>
          }
        />
        <Route
          path="/account"
          element={
            <>
              <Nav />
              <Account />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Login />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Register />
            </>
          }
        />
      </Routes>
      <AnimatePresence>
        {notifications.ongoing && <NotificationBar />}
      </AnimatePresence>
      {/*<NotificationBar />*/}
    </div>
  );
}

export default App;
