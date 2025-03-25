import React, { useEffect, useRef, useState } from "react";
import "./ProductCard.css";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { cartAction, notificationsAction } from "../../Store/store";
import { useNavigate } from "react-router-dom";
function ProductCard({ data, lineClamp = 2, carousel = false }) {
  let [currSlide, setCurrSlide] = React.useState(0);
  let currSlideRef = useRef();
  let dataRef = useRef();
  let interval = useRef();
  let cart = useSelector((state) => state.cart);
  let [star, setStar] = useState(Number(data.totalrating));
  let [presentInCart, setPresentInCart] = useState(false);
  let [cartQuantity, setCartQuantity] = useState(0);
  let [size, setSize] = useState("");
  let dispatch = useDispatch();
  let navigate = useNavigate();
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let USERDATA = useSelector((state) => state.USERDATA);
  let [outOfStock, setOutOfStock] = useState(false);

  useEffect(() => {
    let x = cart.filter((el) => el.productId === data._id && el.size === size);
    if (x.length > 0) {
      setPresentInCart(true);
      setCartQuantity(x[0].qty);
    } else {
      setPresentInCart(false);
    }

    if (data.sizes.length === 0) {
      if (data.quantity === 0) {
        setOutOfStock(true);
      }
    } else {
      let x = data.sizes.filter((el) => el.qty > 0);
      if (x.length === 0) {
        setOutOfStock(true);
      }
    }
  }, [cart, data, size]);

  useEffect(() => {
    if (data.sizes) {
      let x = data.sizes.filter((el) => el.qty !== 0);
      if (x.length > 0) {
        setSize(x[0].name);
      }
    }
  }, [data.sizes]);

  // useEffect(() => {
  //   let x = cart.filter((el) => el.productId === data._id);
  //   if (x.length > 0) {
  //     setPresentInCart(true);
  //     setCartQuantity(x[0].qty);
  //   } else {
  //     setPresentInCart(false);
  //   }
  // }, [size])

  useEffect(() => {
    currSlideRef.current = currSlide;
    dataRef.current = data;
    setStar(Number(data.totalrating));
  }, [currSlide, data]);

  useEffect(() => {
    interval.current = setInterval(() => {
      if (currSlideRef.current === dataRef.current.images.length - 1) {
        setCurrSlide(0);
      } else {
        setCurrSlide((prev) => {
          return prev + 1;
        });
      }
    }, 5 * 1000);
  }, []);

  let [starData, setStarData] = useState(["", "", "", "", ""]);
  useEffect(() => {
    let half = false;
    if (star > Math.floor(star) && star < Math.ceil(star)) {
      half = true;
    }

    let x = starData.map((el, i) => {
      if (i <= star - 1) {
        return "fill";
      } else {
        if (half) {
          half = false;
          return "half";
        }
      }
      return "";
    });

    setStarData(x);
  }, [star]);

  async function qtyChangeHandler(qty) {
    if (!USERDATA._id) {
      if (data.sizes.length === 0) {
        if (data.quantity <= 0) return;

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
          (el) => el.productId === data._id && el.size === size,
        );
        if (x.length > 0) {
          cart = cart.map((el) => {
            if (el.productId === data._id && el.size === size) {
              return { productId: data._id, qty: quantity, size: el.size };
            }
            return el;
          });
        } else {
          cart.push({ productId: data._id, qty: quantity, size: size });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        dispatch(cartAction.loadCart(cart));

        return;
      } else {
        //sizes handler
        let maxQty = data.sizes.filter((el) => el.name === size)[0].qty;

        if (maxQty <= 0) return;

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
          (el) => el.productId === data._id && el.size === size,
        );
        if (x.length > 0) {
          cart = cart.map((el) => {
            if (el.productId === data._id && el.size === size) {
              return { productId: data._id, qty: quantity, size: el.size };
            }
            return el;
          });
        } else {
          cart.push({ productId: data._id, qty: quantity, size: size });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        dispatch(cartAction.loadCart(cart));

        return;
      }
    }

    let data2 = await axios.post(`${CONSTANTS.ip}/api/setCartQty`, {
      productId: data._id,
      qty: qty,
      size: size,
    });
    if (data2.data.status === "ok") {
      console.log(data2.data);
      dispatch(cartAction.loadCart(data2.data.cart));
    } else {
    }
  }

  async function removeItemFromCart() {
    if (!USERDATA._id) {
      let cart = JSON.parse(localStorage.getItem("cart"));
      let final = [];
      cart.forEach((el) => {
        if (el.productId === data._id && el.size === size) {
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
      size: size,
    });
    if (data2.data.status === "ok") {
      dispatch(cartAction.loadCart(data2.data.cart));
    } else {
    }
  }

  return (
    <div
      className="ProductCard"
      style={carousel ? { flex: "0 0", width: "29.1rem" } : {}}
    >
      <div className="ProductCard-Header">
        <h2
          onClick={() => {
            window.location.href = "/product?productNo=" + data._id;
          }}
          className={lineClamp === 1 ? "lineClamp1" : "lineClamp2"}
        >
          {data.title}
        </h2>
        <p
          onClick={() => {
            let query = `/shop?query=${data.brand}&page=1&sort=Relevant`;
            navigate(query);
          }}
        >
          By {data.brand}
        </p>
        <div className={"ProductCard-Star"}>
          {starData.map((el, i) => {
            return (
              <i
                className={`ph-fill ph-star${el === "half" ? "-half" : ""}`}
                style={el !== "" ? { color: "#ffc300" } : {}}
              ></i>
            );
          })}
          <span>({data?.ratings?.length})</span>
        </div>
      </div>

      <div
        className="ProductCard-Image"
        // style={data.sizes.length > 0 ? { height: "24.4rem" } : {}}
      >
        {outOfStock && (
          <div className={"outOfStock-Text"}>
            <i className="ph-bold ph-x"></i>
            <p>Out of Stock</p>
          </div>
        )}
        {data.images.map((el, i) => {
          return (
            <motion.img
              src={`${CONSTANTS.ip}/productImages/Images/${el}`}
              style={{
                transform: `translate(${(i - currSlide) * 100 - 50 + (i - currSlide < 0 ? -10 : i - currSlide > 0 ? 10 : 0)}% , -50%)`,
              }}
              onHoverStart={() => {
                clearInterval(interval.current);
              }}
              onHoverEnd={() => {
                interval.current = setInterval(() => {
                  if (
                    currSlideRef.current ===
                    dataRef.current.images.length - 1
                  ) {
                    setCurrSlide(0);
                  } else {
                    setCurrSlide((prev) => {
                      return prev + 1;
                    });
                  }
                }, 5 * 1000);
              }}
              whileHover={{
                transform: `translate(${(i - currSlide) * 100 - 50}% , -50%) scale(1.15)`,
                transition: {
                  duration: 0.3,
                },
              }}
            />
          );
        })}
      </div>

      <div className={"carousel-dots-cont"}>
        {data.images.map((el, i) => {
          return (
            <div
              className={"carousel-dots"}
              style={
                currSlide === i
                  ? {
                      backgroundColor: "var(--primary-light-blue)",
                    }
                  : {}
              }
              onClick={() => {
                clearInterval(interval.current);
                setCurrSlide(i);
                interval.current = setInterval(() => {
                  if (
                    currSlideRef.current ===
                    dataRef.current.images.length - 1
                  ) {
                    setCurrSlide(0);
                  } else {
                    setCurrSlide((prev) => {
                      return prev + 1;
                    });
                  }
                }, 5 * 1000);
              }}
            ></div>
          );
        })}
      </div>

      {data.sizes.length === 0 && (
        <p className="ProductCard-Warranty">{data.description}</p>
      )}
      {data.sizes.length > 0 && (
        <div className={"ProductCard-Sizes"}>
          {data.sizes.map((el) => {
            return (
              <div
                className={`size ${el.qty === 0 ? "outOfStock" : ""} ${size === el.name ? "selected" : ""}`}
                onClick={() => {
                  if (el.qty > 0) {
                    setSize(el.name);
                  }
                }}
              >
                <p>{el.name}</p>
              </div>
            );
          })}
        </div>
      )}
      <div className="ProductCard-ButtonCont">
        <div className="ProductCard-ButtonCont-Price">
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
        {!outOfStock && (
          <div className="ProductCard-ButtonCont-Button">
            <div
              className={"ProductCard-ButtonCont-Button-Options"}
              style={
                !presentInCart
                  ? { transform: "translate(-50%, -50%)" }
                  : { transform: "translate(-50%, 50%)" }
              }
              onClick={() => {
                // setPresentInCart((prev) => !prev);
                qtyChangeHandler(1);
              }}
            >
              <p>Add To Cart</p>
              <i className="ph-duotone ph-shopping-cart"></i>
            </div>
            <div
              className={"ProductCard-ButtonCont-Button-Options qtySelector"}
              style={
                presentInCart
                  ? { transform: "translate(-50%, -50%)" }
                  : { transform: "translate(-50%, -150%)" }
              }
              onClick={() => setPresentInCart((prev) => !prev)}
            >
              <div
                className={"qtyCont"}
                onClick={() => {
                  // setPresentInCart((prev) => !prev);
                  qtyChangeHandler(cartQuantity + 1);
                }}
              >
                <span>+</span>
              </div>
              <p>{cartQuantity}</p>
              {/*<i className="ph-duotone ph-shopping-cart"></i>*/}
              <div
                className={"qtyCont"}
                onClick={() => {
                  if (cartQuantity === 1) {
                    removeItemFromCart();
                  } else {
                    // setPresentInCart((prev) => !prev);
                    qtyChangeHandler(cartQuantity - 1);
                  }
                }}
              >
                <span>-</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
