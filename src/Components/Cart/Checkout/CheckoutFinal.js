import React from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import useRazorpay from "react-razorpay";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addressAction,
  cartAction,
  categoriesAction,
  UserDataActions,
  wishlistAction,
} from "../../../Store/store";

function CheckoutFinal({
  setStage,
  total,
  amount,
  paymentDetails,
  cartData,
  address,
  payment,
}) {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  return (
    <div className={"CheckoutCart"}>
      <div
        className={"CheckoutCart-ConfirmationWrapper"}
        style={{ marginTop: "0" }}
      >
        <div className={"CheckoutCart-ConfirmationWrapper-Container"}>
          <div className={"CheckoutCart-Header"}>
            <h2 style={{ fontSize: "1.3rem" }}>Order Details</h2>
          </div>
          <div
            className={"CheckoutAddress-Main"}
            style={{ marginBottom: "0", gap: "2rem" }}
          >
            {paymentDetails.order_id && (
              <div
                className={
                  "CheckoutAddress-Main-Address selectedAddress confirmationAddress CheckoutPayment-Header"
                }
              >
                <div className={"CheckoutAddress-Main-Address-Header"}>
                  <h2>ORDER ID</h2>
                </div>
                <span>{paymentDetails.order_id}</span>
              </div>
            )}
            {paymentDetails.receiptId && (
              <div
                className={
                  "CheckoutAddress-Main-Address selectedAddress confirmationAddress CheckoutPayment-Header"
                }
              >
                <div className={"CheckoutAddress-Main-Address-Header"}>
                  <h2>RECEIPT ID</h2>
                </div>
                <span>{paymentDetails.receiptId}</span>
              </div>
            )}
            {paymentDetails.status !== "ok" && (
              <div
                className={
                  "CheckoutAddress-Main-Address selectedAddress confirmationAddress CheckoutPayment-Header"
                }
              >
                <span style={{ fontSize: "1.1rem", color: "rgb(140, 22, 22)" }}>
                  Payment Went Through? Contact us through support with the
                  above order and receipt id's
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={"CheckoutCart-ConfirmationWrapper-Container"}>
          <div className={"CheckoutCart-Header"}>
            <h2 style={{ fontSize: "1.3rem" }}>ORDERED ITEMS</h2>
          </div>
          {cartData.map((data) => (
            <div className="CheckoutCart-CartElement">
              <div
                className="CheckoutCart-CartElement-Image"
                style={{ backgroundColor: "#2c2c2c1d" }}
              >
                <img
                  src={`${CONSTANTS.ip}/productImages/Images/${data.images[0]}`}
                />
              </div>
              <div className="CheckoutCart-CartElement-Content">
                <div className="CheckoutCart-CartElement-Content-Header">
                  <h2
                  // onClick={() => {
                  //   window.location.href = "/product?productNo=" + data._id;
                  // }}
                  >
                    {data.title}
                  </h2>
                  <p>By {data.brand}</p>
                </div>
                {data.variantData.length === 0 && data.size === "" && (
                  <p className={"description"}>{data.description}</p>
                )}
                {(data.variantData.length > 0 || data.size !== "") && (
                  <div className="CheckoutCart-CartElement-Content-ShortContent">
                    <div className="CheckoutCart-CartElement-Content-ShortContent-Main">
                      {data.variantData.map((el) => (
                        <div className="Element">
                          <h2>{el.variant}</h2>
                          <p>{el.data.label}</p>
                        </div>
                      ))}

                      {data.size !== "" && (
                        <div className="Element">
                          <h2>Size</h2>
                          <p>{data.size}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="CheckoutCart-CartElement-Content-PriceDetails">
                  <div className="CheckoutCart-CartElement-Content-PriceDetails-Price">
                    <h2>
                      ₹
                      {data.discount === 0
                        ? data.mrp.toFixed(2)
                        : (data.mrp - data.mrp * (data.discount / 100)).toFixed(
                            2,
                          )}
                    </h2>
                    {data.discount != 0 && (
                      <div className={"mrpCont"}>
                        <span>₹{data.mrp.toFixed(2)}</span>
                        <p>({data.discount}%)</p>
                      </div>
                    )}
                  </div>
                  {data.stockStatus && (
                    <p
                      className={
                        "CheckoutCart-CartElement-Content-PriceDetails-qty"
                      }
                    >
                      x{data.qty}
                    </p>
                  )}
                  {!data.stockStatus && (
                    <div className="CheckoutCart-CartElement-Content-PriceDetails-Buttons">
                      <div className={"outOfStock-Text"}>
                        <i className="ph-bold ph-x"></i>
                        <p>Out of Stock</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={"CheckoutCart-ConfirmationWrapper-Container"}>
          <div className={"CheckoutCart-Header"}>
            <h2 style={{ fontSize: "1.3rem" }}>Delivering to</h2>
          </div>
          <div className={"CheckoutAddress-Main"} style={{ marginBottom: "0" }}>
            <div
              className={
                "CheckoutAddress-Main-Address selectedAddress confirmationAddress"
              }
            >
              <div className={"CheckoutAddress-Main-Address-Header"}>
                <h2>{USERDATA?.address[address]?.name}</h2>
              </div>
              <span>+91 {USERDATA?.address[address]?.mobile}</span>
              <p>{USERDATA?.address[address]?.address}</p>
              <p>
                {USERDATA?.address[address]?.city} -{" "}
                {USERDATA?.address[address]?.pincode}
              </p>
              <p>{USERDATA?.address[address]?.state}</p>
            </div>
          </div>
        </div>
        <div className={"CheckoutCart-ConfirmationWrapper-Container"}>
          <div className={"CheckoutCart-Header"}>
            <h2 style={{ fontSize: "1.3rem" }}>Payment</h2>
          </div>
          <div className={"CheckoutAddress-Main"} style={{ marginBottom: "0" }}>
            {payment === 0 && (
              <div
                className={
                  "CheckoutAddress-Main-Address selectedAddress confirmationAddress CheckoutPayment-Header"
                }
              >
                <div className={"CheckoutAddress-Main-Address-Header"}>
                  <h2>CREDIT CARD/ DEBIT CARD / UPI</h2>
                </div>
                <span>
                  {paymentDetails.status === "ok"
                    ? "Payment Processed through Razorpay"
                    : "Payment Failed"}
                </span>
              </div>
            )}
            {payment === 1 && (
              <div
                className={
                  "CheckoutAddress-Main-Address selectedAddress confirmationAddress CheckoutPayment-Header"
                }
              >
                <div className={"CheckoutAddress-Main-Address-Header"}>
                  <h2>CASH ON DELIVERY</h2>
                </div>
                <span>Paying with Cash during delivery</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={"CheckoutCart-ButtonWrapper"}>
        <button
          onClick={() => {
            dispatch(categoriesAction.setState("Home"));
            window.location.href = "/home";
          }}
        >
          <p>Continue Shopping</p>
          <i className="ph-duotone ph-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default CheckoutFinal;
