import React, { useEffect, useState } from "react";
import "./Checkout.css";
import { useDispatch, useSelector } from "react-redux";
import { categoriesAction } from "../../../Store/store";

function CheckoutShipping({ setStage, setAddressExternal, selectedAddress }) {
  let USERDATA = useSelector((state) => state.USERDATA);
  let [address, setAddress] = useState([]);
  let dispatch = useDispatch();

  useEffect(() => {
    setAddress(USERDATA.address);
  }, [USERDATA]);

  return (
    <div className={"CheckoutCart"}>
      <div className={"CheckoutCart-Header"}>
        <h2>Select Address</h2>
      </div>
      <div className={"CheckoutAddress-Main"}>
        {address?.map((el, i) => (
          <div
            className={`CheckoutAddress-Main-Address ${selectedAddress === i ? "selectedAddress" : ""}`}
            onClick={() => setAddressExternal(i)}
          >
            <div className={"CheckoutAddress-Main-Address-Header"}>
              <h2>{el.name}</h2>
              <div className={"checkbox"}>
                {i === selectedAddress && <i className="ph-bold ph-check"></i>}
              </div>
            </div>
            <span>+91 {el.mobile}</span>
            <p>{el.address}</p>
            <p>
              {el.city} - {el.pincode}
            </p>
            <p>{el.state}</p>
          </div>
        ))}
        {/*<div className={"CheckoutAddress-Main-AddAddress"}>*/}
        {/*  <p>+ADD NEW ADDRESS</p>*/}
        {/*</div>*/}
      </div>
      <div className={"CheckoutCart-ButtonWrapper"}>
        <button
          className={"cancel"}
          onClick={() => {
            dispatch(categoriesAction.setState("Home"));
            window.location.href = "/home";
          }}
        >
          <i className="ph-bold ph-x"></i>
          <p>Cancel Order</p>
        </button>
        <button onClick={() => setStage(3)}>
          <p>Next</p>
          <i className="ph-duotone ph-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default CheckoutShipping;
