import React, { useEffect, useState } from "react";
import "./Checkout.css";
import CheckoutCart from "./CheckoutCart";
import CheckoutShipping from "./CheckoutShipping";
import CheckoutPayment from "./CheckoutPayment";
import CheckoutConfirmation from "./CheckoutConfirmation";
import CheckoutFinal from "./CheckoutFinal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addressAction,
  cartAction,
  UserDataActions,
  wishlistAction,
} from "../../../Store/store";
import useRazorpay from "react-razorpay";

function Checkout(props) {
  let [stage, setStage] = useState(1);
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  const cart = useSelector((state) => state.cart);
  let [cartData, setCartData] = useState([]);
  const [Razorpay] = useRazorpay();

  let [total, setTotal] = useState(0);
  let [tax, setTax] = useState(0);
  let [amount, setAmount] = useState(0);
  let [disableOut, setDisableOut] = useState(false);
  let [address, setAddress] = useState(0);
  let [payment, setPayment] = useState(0);
  let [paymentDetails, setPaymentDetails] = useState({});

  function setAddressExternal(x) {
    setAddress(x);
  }

  function setPaymentExternal(x) {
    setPayment(x);
  }

  function setPaymentDetailsExternal(x) {
    setPaymentDetails(x);
  }

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getBasicData`);
      if (data.data.status === "ok") {
        // console.log(data.data);

        if (data.data.user.cart.length === 0) {
          window.location.href = "/shop";
        }

        dispatch(UserDataActions.loadUserData(data.data.user));
        dispatch(cartAction.loadCart(data.data.user.cart));
        dispatch(wishlistAction.loadWish(data.data.user.wishlist));
        dispatch(addressAction.loadAddress("yes"));
      } else {
        window.location.href = "/login";
      }
    })();
  }, []);

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
    })();
  }, []);

  // useEffect(() => {
  //   let t = 0;
  //   let ta = 0;
  //
  //   cartData.forEach((el) => {
  //     t += el.qty * (el.price - el.price * (el.discount / 100));
  //
  //     ta +=
  //         el.qty *
  //         (el.mrp - el.price - (el.mrp - el.price) * (el.discount / 100));
  //   });
  //
  //   setTax(ta);
  //   setTotal(t);
  // }, [cartData]);

  useEffect(() => {
    (async () => {
      let final = [];
      for (let el of cart) {
        let finalQty = el.qty;
        let stockStatus = true;
        let data = await axios.post(`${CONSTANTS.ip}/api/getProductData`, {
          productId: el.productId,
        });

        if (
          (el.size === "" && data.data.product.sizes.length !== 0) ||
          (el.size !== "" && data.data.product.sizes.length === 0)
        ) {
          let data2 = await axios.post(
            `${CONSTANTS.ip}/api/removeItemFromCart`,
            {
              productId: el.productId,
              size: el.size,
            },
          );
          if (data2.data.status === "ok") {
            dispatch(cartAction.loadCart(data2.data.cart));
            return;
          } else {
            return;
          }
        }

        if (el.size === "") {
          if (data.data.product.quantity === 0) {
            stockStatus = false;
            setDisableOut(true);
          } else if (data.data.product.quantity < finalQty) {
            finalQty = data.data.product.quantity;
          }
        } else {
          let sizeData = data.data.product.sizes.filter(
            (el2) => el2.name === el.size,
          );
          if (sizeData.length === 0) {
            let data2 = await axios.post(
              `${CONSTANTS.ip}/api/removeItemFromCart`,
              {
                productId: el.productId,
                size: el.size,
              },
            );
            if (data2.data.status === "ok") {
              dispatch(cartAction.loadCart(data2.data.cart));
              return;
            } else {
              return;
            }
          } else {
            sizeData = sizeData[0];
            if (sizeData.qty === 0) {
              stockStatus = false;
              setDisableOut(true);
            } else if (sizeData.qty < finalQty) {
              finalQty = sizeData.qty;
            }
          }
        }

        let check = await axios.get(`${CONSTANTS.ip}/api/calculateCart`);

        setTotal(check.data.total.price);
        setTax(check.data.total.tax);
        setAmount(check.data.total.amount);

        if (data.data.status === "ok") {
          let data2 = await axios.post(`${CONSTANTS.ip}/api/getVariantsData`, {
            id: el.productId,
          });

          final.push({
            ...data.data.product,
            qty: finalQty,
            size: el.size,
            variantData: data2.data.variantData,
            stockStatus,
          });
          // dispatch(cartAction.loadCart(data.data.cart));
          // dispatch(UserDataActions.loadUserData(data.data.user));
          // dispatch(cartAction.loadCart(data.data.user.cart));
          // dispatch(wishlistAction.loadWish(data.data.user.wishlist));
          // dispatch(addressAction.loadAddress(data.data.user.address));
        } else {
          // window.location.href = "/login";
        }
      }
      setCartData(final);
    })();
  }, [cart]);

  useEffect(() => {
    if (disableOut) {
      navigate("/cart");
    }
  }, [disableOut]);

  return (
    <div className="Checkout">
      <div className="CheckoutTopBar">
        <div className={"CheckoutTopBar-Header"}>
          <h2>
            {stage === 5
              ? paymentDetails.status === "ok"
                ? "YOUR ORDER HAS BEEN PLACED!"
                : "PAYMENT FAILED"
              : "CHECKOUT"}
          </h2>
        </div>
        <div className={"CheckoutTopBar-StatusBar"}>
          <div className="Element">
            <div
              className={"ElementIcon"}
              style={
                stage > 1
                  ? { background: "#2d6a4f", border: "2px solid #2d6a4f" }
                  : {
                      background: "transparent",
                      border: "2px solid var(--primary-border)",
                    }
              }
            >
              <p style={stage > 1 ? { display: "none" } : { display: "block" }}>
                1
              </p>
              <i
                className="ph-bold ph-check"
                style={stage > 1 ? { display: "block" } : { display: "none" }}
              ></i>
            </div>
            <span
              onClick={() => {
                if (stage > 1 && stage !== 5) {
                  setStage(1);
                }
              }}
            >
              CART
            </span>
          </div>
          <div className="Element">
            <div
              className={"ElementIcon"}
              style={
                stage > 2
                  ? { background: "#2d6a4f", border: "2px solid #2d6a4f" }
                  : {
                      background: "transparent",
                      border: "2px solid var(--primary-border)",
                    }
              }
            >
              <p style={stage > 2 ? { display: "none" } : { display: "block" }}>
                2
              </p>
              <i
                className="ph-bold ph-check"
                style={stage > 2 ? { display: "block" } : { display: "none" }}
              ></i>
            </div>
            <span
              onClick={() => {
                if (stage > 2 && stage !== 5) {
                  setStage(2);
                }
              }}
            >
              SHIPPING
            </span>
          </div>
          <div className="Element">
            <div
              className={"ElementIcon"}
              style={
                stage > 3
                  ? { background: "#2d6a4f", border: "2px solid #2d6a4f" }
                  : {
                      background: "transparent",
                      border: "2px solid var(--primary-border)",
                    }
              }
            >
              <p style={stage > 3 ? { display: "none" } : { display: "block" }}>
                3
              </p>
              <i
                className="ph-bold ph-check"
                style={stage > 3 ? { display: "block" } : { display: "none" }}
              ></i>
            </div>
            <span
              onClick={() => {
                if (stage > 3 && stage !== 5) {
                  setStage(3);
                }
              }}
            >
              PAYMENT
            </span>
          </div>
          <div className="Element">
            <div
              className={"ElementIcon"}
              style={
                stage > 4
                  ? paymentDetails.status === "ok"
                    ? { background: "#2d6a4f", border: "2px solid #2d6a4f" }
                    : { background: "#d24848bf", border: "2px solid #d24848bf" }
                  : {
                      background: "transparent",
                      border: "2px solid var(--primary-border)",
                    }
              }
            >
              <p style={stage > 4 ? { display: "none" } : { display: "block" }}>
                4
              </p>
              <i
                className={`ph-bold ${stage > 4 ? (paymentDetails.status === "ok" ? "ph-check" : "ph-x") : ""}`}
                style={
                  stage > 4
                    ? paymentDetails.status === "ok"
                      ? { display: "block" }
                      : { display: "block", color: "#8c1616" }
                    : { display: "none" }
                }
              ></i>
            </div>
            <span
              onClick={() => {
                if (stage > 4 && stage !== 5) {
                  setStage(4);
                }
              }}
              style={
                stage > 4
                  ? paymentDetails.status !== "ok"
                    ? { color: "#8c1616" }
                    : {}
                  : {}
              }
            >
              CONFIRMATION
            </span>
          </div>
        </div>
      </div>
      <div className="CheckoutWrapper">
        {stage === 1 && (
          <CheckoutCart setStage={setStage} cartData={cartData} />
        )}
        {stage === 2 && (
          <CheckoutShipping
            setStage={setStage}
            cartData={cartData}
            setAddressExternal={setAddressExternal}
            selectedAddress={address}
          />
        )}
        {stage === 3 && (
          <CheckoutPayment
            setStage={setStage}
            cartData={cartData}
            setPaymentExternal={setPaymentExternal}
            selectedPayment={payment}
          />
        )}
        {stage === 4 && (
          <CheckoutConfirmation
            setStage={setStage}
            cartData={cartData}
            total={total}
            address={address}
            payment={payment}
            setPaymentDetailsExternal={setPaymentDetailsExternal}
            amount={amount}
          />
        )}
        {stage === 5 && (
          <CheckoutFinal
            setStage={setStage}
            cartData={cartData}
            paymentDetails={paymentDetails}
            total={total}
            address={address}
            payment={payment}
            amount={amount}
          />
        )}
        <div className="CartContent-DataWrapper">
          <div className="Element Element-orderSummary">
            <h2>ORDER SUMMARY</h2>
            <div className="Element-Details">
              {cartData.map((el) => {
                return (
                  <div className="Element-row">
                    <div className="Element-row-data">
                      <p className="qty">x{el.qty}</p>
                      <p>{el.title}</p>
                    </div>
                    <span>
                      ₹{el.qty * (el.price - el.price * (el.discount / 100))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="Element">
            <div className="Element-Details">
              <div className="Element-row">
                <div className="Element-row-data">
                  <p>AMOUNT</p>
                </div>
                <span>₹{total}</span>
              </div>
              <div className="Element-row">
                <div className="Element-row-data">
                  <p>TAX</p>
                </div>
                <span>₹{tax}</span>
              </div>
            </div>
          </div>
          <div className="Element Element-finalPrice">
            <div className="Element-Details">
              <div className="Element-row">
                <div className="Element-row-data">
                  <span className="orderText">ORDER TOTAL</span>
                </div>
                <span>₹{amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
