import React from "react";
import "./Checkout.css";
import { categoriesAction } from "../../../Store/store";
import { useDispatch } from "react-redux";

function CheckoutPayment({ setStage, selectedPayment, setPaymentExternal }) {
  let dispatch = useDispatch();
  return (
    <div className={"CheckoutCart"}>
      <div className={"CheckoutCart-Header"}>
        <h2>Payment Method</h2>
      </div>
      <div className={"CheckoutAddress-Main"}>
        <div
          className={`CheckoutAddress-Main-Address ${selectedPayment === 0 ? "selectedAddress" : ""} CheckoutPayment-Header`}
          onClick={() => setPaymentExternal(0)}
        >
          <div className={"CheckoutAddress-Main-Address-Header"}>
            <h2>CREDIT CARD/ DEBIT CARD / UPI</h2>
            <div className={"checkbox"}>
              {selectedPayment === 0 && <i className="ph-bold ph-check"></i>}
            </div>
          </div>
          <span>POWERED BY RAZORPAY</span>
        </div>
        <div
          className={`CheckoutAddress-Main-Address ${selectedPayment === 1 ? "selectedAddress" : ""} CheckoutPayment-Header`}
          onClick={() => setPaymentExternal(1)}
        >
          <div className={"CheckoutAddress-Main-Address-Header"}>
            <h2>CASH ON DELIVERY</h2>
            <div className={"checkbox"}>
              {selectedPayment === 1 && <i className="ph-bold ph-check"></i>}
            </div>
          </div>
          <span>Pay with Cash when we deliver it to you</span>
        </div>
        <div className={"CheckoutAddress-Main-Address-gap"}></div>
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
        <button onClick={() => setStage(4)}>
          <p>Next</p>
          <i className="ph-duotone ph-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default CheckoutPayment;
