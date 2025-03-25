import React, { useState } from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useRazorpay from "react-razorpay";
import axios from "axios";
import { categoriesAction, notificationsAction } from "../../../Store/store";

function CheckoutConfirmation({
  setStage,
  total,
  amount,
  setPaymentDetailsExternal,
  address,
  payment,
  cartData,
}) {
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  const cart = useSelector((state) => state.cart);
  const [Razorpay] = useRazorpay();

  const handlePayment = async () => {
    // const order = await createOrder(params); //  Create order on your backend

    let products = cartData.map((el) => {
      return {
        _id: el._id,
        mrp: el.mrp,
        price: el.price,
        qty: el.qty,
        size: el.size,
        cgst: el.cgst,
        igst: el.igst,
        sgst: el.sgst,
      };
    });

    let orderData = await axios.post(`${CONSTANTS.ip}/api/raiseNewSalesOrder`, {
      products,
      paymentMode: payment === 0 ? "RazorPay" : "Cash on Delivery",
      mrp: amount,
      price: total,
      deliveryDetails: USERDATA.address[address],
    });
    if (orderData.data.status === "ok") {
      if (payment === 1) {
        setPaymentDetailsExternal({
          status: "ok",
          receiptId: orderData.data.order._id,
        });
        window.scrollTo({ top: 0 });

        setStage(5);
        return;
      }

      const options = {
        key: orderData.data.paymentDetails.key, // Enter the Key ID generated from the Dashboard
        amount: orderData.data.paymentDetails.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: orderData.data.paymentDetails.currency,
        name: "Suki Soft",
        description: "Payment Dawg",
        image: "https://example.com/your_logo",
        order_id: orderData.data.paymentDetails.id, //This is a sample Order ID. Pass the `id` obtained in the response of createOrder().
        handler: async function (response) {
          //validate payment

          let validate = await axios.post(
            `${CONSTANTS.ip}/api/validatePayment`,
            {
              receiptId: orderData.data.order._id,
              ...response,
              order_id: orderData.data.paymentDetails.id,
            },
          );

          if (validate.data.status === "ok") {
            setPaymentDetailsExternal({
              ...response,
              razorpay_signature: undefined,
              ...validate.data,
              order_id: orderData.data.paymentDetails.id,
              receiptId: orderData.data.order._id,
            });
            window.scrollTo({ top: 0 });
            setStage(5);
          } else {
            setPaymentDetailsExternal({
              ...response,
              razorpay_signature: undefined,
              ...validate.data,
              receiptId: orderData.data.order._id,
            });
            window.scrollTo({ top: 0 });
            setStage(5);
            //payment failed
          }
        },
        modal: {
          confirm_close: true, // this is set to true, if we want confirmation when clicked on cross button.
          // This function is executed when checkout modal is closed
          // There can be 3 reasons when this modal is closed.
          ondismiss: async (reason) => {
            const {
              reason: paymentReason,
              field,
              step,
              code,
            } = reason && reason.error ? reason.error : {};

            let validate = await axios.post(
              `${CONSTANTS.ip}/api/paymentFailed`,
              {
                receiptId: orderData.data.order._id,
              },
            );

            setPaymentDetailsExternal({
              razorpay_signature: undefined,
              status: "fail",
              order_id: orderData.data.paymentDetails.id,
              receiptId: orderData.data.order._id,
            });
            window.scrollTo({ top: 0 });
            setStage(5);
          },
        },
        prefill: {
          name: USERDATA.firstName + " " + USERDATA.lastName,
          email: USERDATA.email,
          contact: USERDATA.mobile,
        },
        notes: {
          address: "Dubai Kuruku Sandhu",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new Razorpay(options);

      rzp1.on("payment.failed", async function (response) {
        //payment failed

        let validate = await axios.post(`${CONSTANTS.ip}/api/paymentFailed`, {
          receiptId: orderData.data.order._id,
        });

        setPaymentDetailsExternal({
          ...response,
          razorpay_signature: undefined,
          status: "fail",
          order_id: orderData.data.paymentDetails.id,
          receiptId: orderData.data.order._id,
        });
        window.scrollTo({ top: 0 });
        setStage(5);
      });

      rzp1.open();
    } else {
      dispatch(
        notificationsAction.setNotification({
          type: "someWrong",
          color: "red",
          message: orderData.data.message || "Something went wrong",
        }),
      );
      return;
      // console.log(orderData.data);
      // window.location.href = "/login";
    }
  };

  return (
    <div className={"CheckoutCart"}>
      <div className={"CheckoutCart-Header"}>
        <h2>CONFIRM ORDER</h2>
      </div>

      <div className={"CheckoutCart-ConfirmationWrapper"}>
        <div className={"CheckoutCart-ConfirmationWrapper-Container"}>
          <div className={"CheckoutCart-Header"}>
            <h2 style={{ fontSize: "1.3rem" }}>CART</h2>
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
            <h2 style={{ fontSize: "1.3rem" }}> Delivery Information</h2>
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
            <h2 style={{ fontSize: "1.3rem" }}>Payment Method</h2>
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
                <span>POWERED BY RAZORPAY</span>
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
                <span>Pay with Cash when we deliver it to you</span>
              </div>
            )}{" "}
          </div>
        </div>
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
        <button
          onClick={() => {
            handlePayment();
            // setStage(5);
          }}
        >
          <p>
            {payment === 0
              ? "Proceed to Payment (RazorPay)"
              : "Place Order (Cash on Delivery)"}
          </p>
          <i className="ph-duotone ph-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default CheckoutConfirmation;
