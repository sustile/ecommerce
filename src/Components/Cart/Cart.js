import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  addressAction,
  cartAction,
  notificationsAction,
  UserDataActions,
  wishlistAction,
} from "../../Store/store";
import { useDispatch, useSelector } from "react-redux";

function Cart(props) {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  const cart = useSelector((state) => state.cart);
  let [cartData, setCartData] = useState([]);
  let [disableOut, setDisableOut] = useState(false);
  let [total, setTotal] = useState(0);
  let [tax, setTax] = useState(0);
  let [cartEmpty, setCartEmpty] = useState(true);

  useEffect(() => {
    (async () => {
      if (!USERDATA._id) {
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (!cart) {
          localStorage.setItem("cart", JSON.stringify([]));
          dispatch(cartAction.loadCart([]));
        } else {
          dispatch(cartAction.loadCart(cart));
        }
      } else {
        let data = await axios.get(`${CONSTANTS.ip}/api/getCartUnrouted`);
        if (data.data.status === "ok") {
          dispatch(cartAction.loadCart(data.data.cart));
          // dispatch(UserDataActions.loadUserData(data.data.user));
          // dispatch(cartAction.loadCart(data.data.user.cart));
          // dispatch(wishlistAction.loadWish(data.data.user.wishlist));
          // dispatch(addressAction.loadAddress(data.data.user.address));
        } else {
          // window.location.href = "/login";
        }
      }
    })();
  }, []);

  useEffect(() => {
    let t = 0;
    let ta = 0;

    cartData.forEach((el) => {
      t += el.qty * (el.price - el.price * (el.discount / 100));

      ta +=
        el.qty *
        (el.mrp - el.price - (el.mrp - el.price) * (el.discount / 100));
    });

    setTax(ta.toFixed(2));
    setTotal(t.toFixed(2));
  }, [cartData]);

  useEffect(() => {
    (async () => {
      let final = [];

      if (cart.length === 0) {
        setCartEmpty(true);
      } else {
        setCartEmpty(false);
      }

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

        //
        // let check = await axios.get(`${CONSTANTS.ip}/api/calculateCart`);
        //
        // console.log(check.data);

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

  return (
    <div className="Cart">
      <div className="CartWrapper">
        <div className="CartHeader">
          <h2>MY CART</h2>
        </div>
        <div className="CartContent">
          <div className="CartContent-Wrapper">
            {cartData.map((el) => (
              <CartElement data={el} />
            ))}
            {/*<CartElement />*/}
            {/*<CartElement />*/}
            {cartEmpty && (
              <div className={"cartEmpty"}>
                <h2>Your Shopping Cart is Empty!</h2>
                <button
                  className="shopButton"
                  onClick={() => navigate("/shop")}
                >
                  <p>Start Shopping!</p>
                  <i className="ph-duotone ph-shopping-bag"></i>
                </button>
              </div>
            )}
          </div>
          {!cartEmpty && (
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
                          ₹
                          {(
                            el.qty *
                            (el.price - el.price * (el.discount / 100))
                          ).toFixed(2)}
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
                    <span>₹{(Number(total) + Number(tax)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {!USERDATA._id && (
                <div className="Element Element-finalPrice">
                  <button
                    className="CheckoutButton"
                    style={{ backgroundColor: "#2c2c2c" }}
                    onClick={() => navigate("/login")}
                  >
                    <p>Login to Continue</p>
                  </button>
                </div>
              )}
              {USERDATA._id && disableOut && (
                <div className="Element Element-finalPrice">
                  <div className={"disableOut"}>
                    <p>Please remove out of stock items to continue</p>
                  </div>
                </div>
              )}
              {USERDATA._id && !disableOut && (
                <div className="Element Element-finalPrice">
                  <button
                    className="CheckoutButton"
                    onClick={() => navigate("/checkout")}
                  >
                    <i className="ph-duotone ph-shopping-bag"></i>
                    <p>Checkout</p>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartElement({ data }) {
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let USERDATA = useSelector((state) => state.USERDATA);
  let [qty, setQty] = useState(1);
  let dispatch = useDispatch();

  async function qtyChangeHandler(qty) {
    if (!USERDATA._id) {
      if (data.sizes.length === 0) {
        //no sizes handler
        let quantity = qty > data.quantity ? data.quantity : qty;

        if (qty > data.quantity) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum quantity reached",
            }),
          );
        }

        let cart = JSON.parse(localStorage.getItem("cart"));
        let x = cart.filter(
          (el) => el.productId === data._id && el.size === data.size,
        );
        if (x.length > 0) {
          cart = cart.map((el) => {
            if (el.productId === data._id && el.size === data.size) {
              return { productId: data._id, qty: quantity, size: el.size };
            }
            return el;
          });
        } else {
          cart.push({ productId: data._id, qty: quantity, size: data.size });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        dispatch(cartAction.loadCart(cart));

        return;
      } else {
        //sizes handler
        let maxQty = data.sizes.filter((el) => el.name === data.size)[0].qty;
        let quantity = qty > maxQty ? maxQty : qty;

        if (qty > maxQty) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum quantity reached",
            }),
          );
        }

        let cart = JSON.parse(localStorage.getItem("cart"));
        let x = cart.filter(
          (el) => el.productId === data._id && el.size === data.size,
        );
        if (x.length > 0) {
          cart = cart.map((el) => {
            if (el.productId === data._id && el.size === data.size) {
              return { productId: data._id, qty: quantity, size: el.size };
            }
            return el;
          });
        } else {
          cart.push({ productId: data._id, qty: quantity, size: data.size });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        dispatch(cartAction.loadCart(cart));

        return;
      }
    }

    if (qty > data.quantity) {
      dispatch(
        notificationsAction.setNotification({
          type: "cartAdd",
          color: "yellow",
          message: "Maximum quantity reached",
        }),
      );
      return;
    }

    let data2 = await axios.post(`${CONSTANTS.ip}/api/setCartQty`, {
      productId: data._id,
      qty: qty,
      size: data.size,
    });
    if (data2.data.status === "ok") {
      dispatch(cartAction.loadCart(data2.data.cart));
    } else {
    }
  }

  // async function qtyChangeHandler() {
  //   if (!USERDATA._id) {
  //     if (data.sizes.length === 0) {
  //       //no sizes handler
  //       let quantity =
  //           qty > data.quantity ? data.quantity : qty;
  //
  //       if (qty > data.quantity) {
  //         dispatch(
  //             notificationsAction.setNotification({
  //               type: "cartAdd",
  //               color: "yellow",
  //               message: "Maximum quantity reached",
  //             }),
  //         );
  //       }
  //
  //       let cart = JSON.parse(localStorage.getItem("cart"));
  //       let x = cart.filter(
  //           (el) => el.productId === data._id && el.size === data.size,
  //       );
  //       if (x.length > 0) {
  //         cart = cart.map((el) => {
  //           if (el.productId === data._id && el.size === data.size) {
  //             let finalQty =
  //                 el.qty + quantity > data.quantity
  //                     ? data.quantity
  //                     : el.qty + quantity;
  //             if (el.qty + quantity > data.quantity) {
  //               dispatch(
  //                   notificationsAction.setNotification({
  //                     type: "cartAdd",
  //                     color: "yellow",
  //                     message: "Maximum quantity reached",
  //                   }),
  //               );
  //             }
  //             return {
  //               productId: data._id,
  //               qty: finalQty,
  //               size: el.size,
  //             };
  //           }
  //           return el;
  //         });
  //       } else {
  //         cart.push({
  //           productId: data._id,
  //           qty: quantity,
  //           size: data.size,
  //         });
  //       }
  //       localStorage.setItem("cart", JSON.stringify(cart));
  //       dispatch(cartAction.loadCart(cart));
  //       dispatch(
  //           notificationsAction.setNotification({
  //             type: "cartAdd",
  //             color: "green",
  //             message: "Item added to Cart",
  //           }),
  //       );
  //
  //       return;
  //     } else {
  //       //sizes handler
  //       let maxQty = data.sizes.filter((el) => el.name === data.size)[0]
  //           .qty;
  //       let quantity = qty > maxQty ? maxQty : qty;
  //
  //       if (qty > maxQty) {
  //         dispatch(
  //             notificationsAction.setNotification({
  //               type: "cartAdd",
  //               color: "yellow",
  //               message: "Maximum quantity reached",
  //             }),
  //         );
  //       }
  //
  //       let cart = JSON.parse(localStorage.getItem("cart"));
  //       let x = cart.filter(
  //           (el) => el.productId === data._id && el.size === data.size,
  //       );
  //       if (x.length > 0) {
  //         cart = cart.map((el) => {
  //           if (el.productId === data._id && el.size === data.size) {
  //             let quantity = el.qty + qty > maxQty ? maxQty : el.qty + qty;
  //
  //             if (el.qty + qty > maxQty) {
  //               dispatch(
  //                   notificationsAction.setNotification({
  //                     type: "cartAdd",
  //                     color: "yellow",
  //                     message: "Maximum quantity reached",
  //                   }),
  //               );
  //             }
  //
  //             return {
  //               productId: data._id,
  //               qty: quantity,
  //               size: el.size,
  //             };
  //           }
  //           return el;
  //         });
  //       } else {
  //         cart.push({
  //           productId: data._id,
  //           qty: quantity,
  //           size: data.size,
  //         });
  //       }
  //       localStorage.setItem("cart", JSON.stringify(cart));
  //       dispatch(cartAction.loadCart(cart));
  //       dispatch(
  //           notificationsAction.setNotification({
  //             type: "cartAdd",
  //             color: "green",
  //             message: "Item added to Cart",
  //           }),
  //       );
  //
  //       return;
  //     }
  //   }
  //
  //   let data = await axios.post(`${CONSTANTS.ip}/api/addToCart`, {
  //     productId: itemCode,
  //     qty: qty,
  //     size: size,
  //   });
  //   if (data.data.status === "ok") {
  //     dispatch(cartAction.loadCart(data.data.cart));
  //     dispatch(
  //         notificationsAction.setNotification({
  //           type: "cartAdd",
  //           color: "green",
  //           message: "Item added to Cart",
  //         }),
  //     );
  //     // setRawProductData(data.data.product);
  //     // setStar(data.data.product.totalrating);
  //     // setImageCarousel(data.data.product.images);
  //   } else {
  //     dispatch(
  //         notificationsAction.setNotification({
  //           type: "someWrong",
  //           color: "red",
  //           message: "Something went wrong",
  //         }),
  //     );
  //   }
  // }

  async function removeItemFromCart() {
    if (!USERDATA._id) {
      let cart = JSON.parse(localStorage.getItem("cart"));
      let final = [];
      cart.forEach((el) => {
        if (el.productId === data._id && el.size === data.size) {
        } else {
          final.push(el);
        }
      });
      localStorage.setItem("cart", JSON.stringify(final));
      dispatch(cartAction.loadCart(final));

      return;
    }

    let data2 = await axios.post(`${CONSTANTS.ip}/api/removeItemFromCart`, {
      productId: data._id,
      size: data.size,
    });
    if (data2.data.status === "ok") {
      dispatch(cartAction.loadCart(data2.data.cart));
    } else {
    }
  }

  return (
    <div className="CartElement">
      <div className="CartElement-Image">
        <img src={`${CONSTANTS.ip}/productImages/Images/${data.images[0]}`} />
      </div>
      <div className="CartElement-Content">
        <div className="CartElement-Content-Header">
          <h2
            onClick={() => {
              window.location.href = "/product?productNo=" + data._id;
            }}
          >
            {data.title}
          </h2>
          <p>By {data.brand}</p>
        </div>
        {data.variantData.length === 0 && data.size === "" && (
          <p className={"description"}>{data.description}</p>
        )}
        {(data.variantData.length > 0 || data.size !== "") && (
          <div className="CartElement-Content-ShortContent">
            <div className="CartElement-Content-ShortContent-Main">
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
        <div className="CartElement-Content-PriceDetails">
          <div className="CartElement-Content-PriceDetails-Price">
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
          <div className="CartElement-Content-PriceDetails-Buttons">
            <i
              className="ph-duotone ph-trash delete "
              onClick={() => {
                removeItemFromCart();
              }}
            ></i>
            {!data.stockStatus && (
              <div className={"outOfStock-Text"}>
                <i className="ph-bold ph-x"></i>
                <p>Out of Stock</p>
              </div>
            )}
            {data.stockStatus && (
              <div className="ChangeQuantity">
                <div
                  className="ChangeQuantity-sign"
                  onClick={() => {
                    if (data.qty > 1) {
                      qtyChangeHandler(data.qty - 1);
                      // setQty((prev) => prev - 1);
                    }
                  }}
                >
                  <p>-</p>
                </div>
                <p className="ChangeQuantity-value">{data.qty}</p>
                <div
                  className="ChangeQuantity-sign"
                  onClick={() => {
                    if (data.qty < data.quantity) {
                      qtyChangeHandler(data.qty + 1);
                      // setQty((prev) => prev + 1);
                    }
                  }}
                >
                  <p>+</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
