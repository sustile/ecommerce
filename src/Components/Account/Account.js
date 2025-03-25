import React, { useEffect, useState } from "react";
import "./Account.css";
import AccountDetails from "./AccountDetails";
import AccountAddress from "./AccountAddress";
import AccountOrders from "./AccountOrders";
import AccountHelpdesk from "./AccountHelpdesk";
import axios from "axios";
import {
  addressAction,
  cartAction,
  UserDataActions,
  wishlistAction,
} from "../../Store/store";
import { useDispatch, useSelector } from "react-redux";

function Account(props) {
  let [page, setPage] = useState(0);
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getBasicData`);
      if (data.data.status === "ok") {
        // console.log(data.data);
        dispatch(UserDataActions.loadUserData(data.data.user));
        dispatch(cartAction.loadCart(data.data.user.cart));
        dispatch(wishlistAction.loadWish(data.data.user.wishlist));
        dispatch(addressAction.loadAddress(data.data.user.address));
      } else {
        window.location.href = "/login";
      }
    })();
  }, []);

  return (
    <div className={"Account"}>
      <div className={"AccountWrapper"}>
        <div className={"AccountHeader"}>
          <h2>MY ACCOUNT</h2>
        </div>

        <div className={"AccountContent"}>
          <div className={"AccountOptions"}>
            <div className={"top"}>
              <div
                className={`Element ${page === 0 ? "selectedOption" : ""}`}
                onClick={() => setPage(0)}
              >
                <i className="ph-bold ph-stack-simple"></i>
                <p>Account</p>
              </div>
              <div
                className={`Element ${page === 1 ? "selectedOption" : ""}`}
                onClick={() => setPage(1)}
              >
                <i className="ph-bold ph-address-book-tabs"></i>
                <p>Address Book</p>
              </div>
              <div
                className={`Element ${page === 2 ? "selectedOption" : ""}`}
                onClick={() => setPage(2)}
              >
                <i className="ph-bold ph-truck"></i>
                <p>My Orders</p>
              </div>
            </div>
            <div className={"bottom"}>
              <div
                className={`Element ${page === 3 ? "selectedOption" : ""}`}
                onClick={() => setPage(3)}
              >
                <i className="ph-bold ph-headset"></i>
                <p>Helpdesk</p>
              </div>
              <div
                className={"Element signout"}
                onClick={() => {
                  window.location.href = "/logout";
                }}
              >
                <i className="ph-bold ph-sign-out"></i>
                <p>Sign Out</p>
              </div>
            </div>
          </div>
          <div className={"AccountMain"}>
            {page === 0 && <AccountDetails />}
            {page === 1 && <AccountAddress />}
            {page === 2 && <AccountOrders />}
            {page === 3 && <AccountHelpdesk />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
