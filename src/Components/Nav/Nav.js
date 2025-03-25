import React, { useEffect, useRef, useState } from "react";
import "./Nav.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addressAction,
  cartAction,
  categoriesAction,
  UserDataActions,
  wishlistAction,
} from "../../Store/store";

function Nav({ type = "normal" }) {
  let navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  let [num, setNum] = useState(0);
  let dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let categories = useSelector((state) => state.categories);
  let categoriesRef = useRef();
  let [currPath, setCurrPath] = useState(false);
  let [search, setSearch] = useState(
    searchParams.get("query") ? searchParams.get("query") : ""
  );

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getBasicDataUnrouted`);
      if (data.data.status === "ok") {
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (cart && cart.length > 0) {
          //check if items in cart are valid. then insert them into the cart
          for (let el of cart) {
            let data2 = await axios.post(`${CONSTANTS.ip}/api/addToCart`, {
              productId: el.productId,
              qty: el.qty,
              size: el.size,
            });
          }

          localStorage.removeItem("cart");

          data = await axios.get(`${CONSTANTS.ip}/api/getBasicDataUnrouted`);
        }

        dispatch(UserDataActions.loadUserData(data.data.user));
        dispatch(cartAction.loadCart(data.data.user.cart));
        dispatch(wishlistAction.loadWish(data.data.user.wishlist));
        dispatch(addressAction.loadAddress(data.data.user.address));
      } else {
        console.log("no user-guest mode");
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (!cart) {
          localStorage.setItem("cart", JSON.stringify([]));
          dispatch(cartAction.loadCart([]));
        } else {
          dispatch(cartAction.loadCart(cart));
        }

        // window.location.href = "/login";
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (categories.current === "Home") {
  //     // navigate("/home");
  //   }
  // }, [categories]);

  useEffect(() => {
    let num = 0;
    cart.forEach((el) => {
      num += el.qty;
    });
    setNum(num);
  }, [cart]);

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getCart`);
      if (data.data.status === "ok") {
        dispatch(cartAction.loadCart(data.data.cart));
        // dispatch(UserDataActions.loadUserData(data.data.user));
        // dispatch(cartAction.loadCart(data.data.user.cart));
        // dispatch(wishlistAction.loadWish(data.data.user.wishlist));
        // dispatch(addressAction.loadAddress(data.data.user.address));
      } else {
        // window.location.href = "/login";
      }

      data = await axios.get(`${CONSTANTS.ip}/api/getCategories`);
      if (data.data.status === "ok") {
        dispatch(categoriesAction.loadCat(data.data.category));

        let search = searchParams.get("query");

        let x = data.data.category.map((el) => el.title);
        if (window.location.pathname === "/shop") {
          if (x.includes(search)) {
            dispatch(categoriesAction.setState(search));
          } else {
            dispatch(categoriesAction.setState(""));
          }
        } else if (window.location.pathname === "/product") {
          dispatch(categoriesAction.setState(""));
        } else if (window.location.pathname === "/home") {
          dispatch(categoriesAction.setState("Home"));
        }

        // if(x.includes())

        // dispatch(UserDataActions.loadUserData(data.data.user));
        // dispatch(cartAction.loadCart(data.data.user.cart));
        // dispatch(wishlistAction.loadWish(data.data.user.wishlist));
        // dispatch(addressAction.loadAddress(data.data.user.address));
      } else {
        // window.location.href = "/login";
      }
    })();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("query"));
    let search = searchParams.get("query");

    let x = categoriesRef.current?.categories?.map((el) => el.title);
    if (window.location.pathname === "/shop") {
      if (x.includes(search)) {
        dispatch(categoriesAction.setState(search));
      } else {
        dispatch(categoriesAction.setState(""));
      }
    }
  }, [searchParams]);

  async function submitHandler(e) {
    e.preventDefault();
    if (!search) return;
    let query = `/shop?query=${search}&page=1&sort=Relevant`;
    navigate(query);
  }

  useEffect(() => {
    setCurrPath(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <div className={"Nav"}>
      <div
        className={"Nav-TopBar"}
        style={currPath === "/checkout" ? { padding: "0.6rem 0rem" } : {}}
      >
        <div className={"Nav-TopBar-LogoCont"}>
          <img
            src={"./Assets/Images/onlyLogo.svg"}
            alt={"logo"}
            style={{ height: "4rem" }}
            onClick={() => {
              if (currPath === "/checkout") {
                return;
              }
              navigate("/home");
              dispatch(categoriesAction.setState("Home"));
            }}
          />
          {currPath !== "/checkout" && (
            <form
              className={"Nav-TopBar-LogoCont-SearchBar"}
              onSubmit={submitHandler}
            >
              <input
                type={"text"}
                placeholder={"Search"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="ph-duotone ph-magnifying-glass searchIcon"
                type={"submit"}
              ></button>
            </form>
          )}
        </div>
        {currPath !== "/checkout" && (
          <div className={"Nav-TopBar-Button"}>
            {USERDATA._id && USERDATA.address.length > 0 && (
              <div
                className="Btn"
                style={{
                  borderRight: "2px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "0",
                  padding: "0rem 3.5rem",
                }}
              >
                <i className="ph ph-map-pin"></i>
                <div className={"Btn-TextBox"}>
                  <p className={"account-text"}>
                    Deliver to {USERDATA.address[0].name}
                  </p>
                  <p>
                    {USERDATA.address[0].city}, {USERDATA.address[0].pincode}
                  </p>
                </div>
              </div>
            )}
            {currPath !== "/checkout" && (
              <div
                className="Btn HoverBtn"
                onClick={() => {
                  if (USERDATA._id) {
                    navigate("/account");
                  } else {
                    navigate("/login");
                  }
                }}
              >
                <i className="ph-duotone ph-user"></i>
                <div className={"Btn-TextBox"}>
                  <p className={"account-text"}>
                    {USERDATA._id ? `Hello, ${USERDATA.firstName}` : "Login"}
                  </p>
                  <p>Account</p>
                </div>
              </div>
            )}
            <div className="Btn HoverBtn" onClick={() => navigate("/cart")}>
              <i className="ph-duotone ph-shopping-cart"></i>
              <div className={"Btn-TextBox"}>
                <p className={"account-text"}>Shopping Cart</p>
                {/*<p>Shopping</p>*/}
                {/*<p className="cartCounter">{num}</p>*/}
                <p className="cartCounter">{num > 0 ? num : "Empty"}</p>
              </div>
            </div>
          </div>
        )}{" "}
      </div>
      {currPath !== "/checkout" && (
        <div className={"Nav-BottomBar"}>
          <div
            className={`Nav-BottomBar-Option ${
              categories.current === "Home" ? "selectedOption" : ""
            }`}
            onClick={() => {
              navigate("/home");
              dispatch(categoriesAction.setState("Home"));
            }}
          >
            <p>Home</p>
            <i className="ph-bold ph-list"></i>
          </div>
          {categories.categories.map((el) => (
            <div
              className={`Nav-BottomBar-Option ${
                categories.current === el.title ? "selectedOption" : ""
              }`}
              onClick={() => {
                dispatch(categoriesAction.setState(el.title));
                let query = `/shop?query=${el.title}&page=1&sort=Relevant`;
                navigate(query);
              }}
            >
              <p>{el.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Nav;
