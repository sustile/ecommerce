import React, { useEffect, useRef, useState } from "react";
import "./Account.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addressAction,
  cartAction,
  UserDataActions,
  wishlistAction,
} from "../../Store/store";
import { current } from "@reduxjs/toolkit";

function AccountOrders(props) {
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let cart = useSelector((state) => state.cart);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let [page, setPage] = useState(1);
  let [rawProducts, setRawProducts] = useState([]);
  let pageRef = useRef();

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    (async () => {
      let data = await axios.post(`${CONSTANTS.ip}/api/lazyLoadOrders`, {
        page: pageRef.current,
      });
      if (data.data.status === "ok") {
        setRawProducts(data.data.result);
      } else {
        // window.location.href = "/login";
      }
    })();
  }, []);

  return (
    <>
      <div className={"AccountMain-Header"}>
        <h2>MY ORDERS</h2>
        <p>VIEW AND TRACK YOUR ORDERS</p>
      </div>
      <div className={"AccountMain-OrderContainer"}>
        {rawProducts.map((data) => (
          <OrderElement data={data} />
        ))}
      </div>
    </>
  );
}

function OrderElement({ data }) {
  let [date, setDate] = useState();
  let monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let [productData, setProductData] = useState([]);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);

  useEffect(() => {
    let d = new Date(data.createdAt);
    let x = `${d.getDate()} ${monthList[d.getMonth()]} ${d.getFullYear()}`;
    setDate(x);
  }, [data]);

  useEffect(() => {
    (async () => {
      let final = [];
      for (let el of data.products) {
        let data2 = await axios.post(`${CONSTANTS.ip}/api/getProductData`, {
          productId: el._id,
        });
        if (data2.data.status === "ok") {
          final.push({ ...data2.data.product, ...el });
        }
      }

      setProductData(final);
    })();
  }, [data]);

  return (
    <div className={"AccountMain-OrderContainer-OrderElement"}>
      <div className={"AccountMain-OrderContainer-OrderElement-Header"}>
        <div
          className={
            "AccountMain-OrderContainer-OrderElement-Header-Element Right"
          }
        >
          <span># {data._id}</span>
          <p>{data.orderStatus}</p>
        </div>
        <div
          className={
            "AccountMain-OrderContainer-OrderElement-Header-Element Left"
          }
        >
          <span>Order Placed on</span>
          <p>{date}</p>
        </div>
      </div>
      <div className={"AccountMain-OrderContainer-OrderElement-Container"}>
        <div
          className={
            "AccountMain-OrderContainer-OrderElement-Container-LeftWrapper"
          }
        >
          {productData.map((data) => (
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
                    onClick={() => {
                      window.location.href = "/product?productNo=" + data._id;
                    }}
                  >
                    {data.title}
                  </h2>
                  <p style={{ cursor: "auto", textDecoration: "none" }}>
                    Size : {data.size}
                  </p>
                </div>
                {/*{(data.variantData.length > 0 || data.size !== "") && (*/}
                {/*  <div className="CheckoutCart-CartElement-Content-ShortContent">*/}
                {/*    <div className="CheckoutCart-CartElement-Content-ShortContent-Main">*/}
                {/*      {data.variantData.map((el) => (*/}
                {/*        <div className="Element">*/}
                {/*          <h2>{el.variant}</h2>*/}
                {/*          <p>{el.data.label}</p>*/}
                {/*        </div>*/}
                {/*      ))}*/}

                {/*      {data.size !== "" && (*/}
                {/*        <div className="Element">*/}
                {/*          <h2>Size</h2>*/}
                {/*          <p>{data.size}</p>*/}
                {/*        </div>*/}
                {/*      )}*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*)}*/}
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
                  <p
                    className={
                      "CheckoutCart-CartElement-Content-PriceDetails-qty"
                    }
                  >
                    x{data.qty}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div
            className={
              "AccountMain-OrderContainer-OrderElement-Container-LeftWrapper-Bottom"
            }
          >
            <h2>ORDER TOTAL</h2>
            <p>₹{data.mrp}</p>
          </div>
        </div>
        <div
          className={"AccountMain-OrderContainer-OrderElement-Container-Right"}
        >
          <button
            className={
              "AccountMain-OrderContainer-OrderElement-Container-Right-Element"
            }
          >
            <p>Order Summary</p>
          </button>
          <button
            className={
              "AccountMain-OrderContainer-OrderElement-Container-Right-Element"
            }
          >
            <p>Track Order</p>
          </button>
          {data.orderStatus !== "Delivered" && (
            <button
              className={
                "AccountMain-OrderContainer-OrderElement-Container-Right-Element"
              }
              style={{ backgroundColor: "rgba(210, 72, 72, 0.75)" }}
            >
              <p style={{ color: "#8C1616" }}>Cancel Order</p>
            </button>
          )}
          <button
            className={
              "AccountMain-OrderContainer-OrderElement-Container-Right-Element downloadInvoice"
            }
          >
            <p>Download Invoice</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountOrders;
