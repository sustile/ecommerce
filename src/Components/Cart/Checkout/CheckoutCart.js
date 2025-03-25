import React from "react";
import "./Checkout.css";
import { useDispatch, useSelector } from "react-redux";
import { categoriesAction } from "../../../Store/store";

function CheckoutCart({ setStage, cartData }) {
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let dispatch = useDispatch();
  return (
    <div className={"CheckoutCart"}>
      <div className={"CheckoutCart-Header"}>
        <h2>CART</h2>
      </div>
      {cartData.map((data) => (
        <div className="CheckoutCart-CartElement">
          <div className="CheckoutCart-CartElement-Image">
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
                    : (data.mrp - data.mrp * (data.discount / 100)).toFixed(2)}
                </h2>
                {data.discount != 0 && (
                  <div className={"mrpCont"}>
                    <span>₹{data.mrp.toFixed(2)}</span>
                    <p>({data.discount}%)</p>
                  </div>
                )}
              </div>
              <p
                className={"CheckoutCart-CartElement-Content-PriceDetails-qty"}
              >
                x{data.qty}
              </p>
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
        <button onClick={() => setStage(2)}>
          <p>Next</p>
          <i className="ph-duotone ph-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default CheckoutCart;
