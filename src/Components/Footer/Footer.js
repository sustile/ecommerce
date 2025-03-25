import React from "react";
import "./Footer.css";
import { categoriesAction } from "../../Store/store";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function Footer(props) {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  return (
    <div className={"Footer"}>
      <div className={"Links"}>
        <div className={"Column"}>
          <h2>Customer Service</h2>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            FAQ
          </p>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Shipping Information
          </p>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Returns, Refunds & Exchanges
          </p>

          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Contact Us
          </p>
        </div>
        <div className={"Column"}>
          <h2>Account & Orders</h2>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Orders
          </p>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Wishlist
          </p>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Manage Account
          </p>
        </div>
        <div className={"Column"}>
          <h2>Legal & Privacy</h2>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Terms & Conditions
          </p>
          <p
            onClick={() => {
              navigate("/home");
            }}
          >
            Privacy Policy
          </p>
        </div>
      </div>
      <div className={"Content"}>
        <div className={"LeftSide"}>
          <div className={"LogoCont"}>
            <img
              src={"./Assets/Images/onlyLogo.svg"}
              style={{ height: "8rem" }}
              alt={"logo"}
              onClick={() => {
                navigate("/home");
                dispatch(categoriesAction.setState("Home"));
              }}
            />
          </div>
        </div>
        <div className={"socials"}>
          <i className="ph ph-instagram-logo"></i>
          <i className="ph ph-threads-logo"></i>
          <i className="ph ph-facebook-logo"></i>
          <i className="ph ph-x-logo"></i>
        </div>
        <div className={"RightSide"}>
          <div className="Btn HoverBtn">
            <i className="ph-light ph-apple-logo"></i>
            <div className={"Btn-TextBox"}>
              <p className={"account-text"}>Download on the</p>
              <p>App Store</p>
            </div>
          </div>
          <div className="Btn HoverBtn">
            <i className="ph-light ph-google-play-logo"></i>
            <div className={"Btn-TextBox"}>
              <p className={"account-text"}>Get in on</p>
              <p>Google Play</p>
            </div>
          </div>
        </div>
      </div>
      <div className={"Bottom"}>
        <h2>© Cloud Computing Ecommerce. All Rights Reserved</h2>
      </div>
    </div>
  );
}

export default Footer;
