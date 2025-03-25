import React, { useEffect, useRef, useState } from "react";
import "./ProductPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  addressAction,
  cartAction,
  categoriesAction,
  notificationsAction,
  UserDataActions,
  wishlistAction,
} from "../Store/store";
import Reviews from "./Reviews";

function ProductPage(props) {
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let USERDATA = useSelector((state) => state.USERDATA);
  let [currSlide, setCurrSlide] = React.useState(0);
  let currSlideRef = useRef();
  let [star, setStar] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  let [itemCode, setItemCode] = useState(searchParams.get("productNo"));
  let [rawProductData, setRawProductData] = useState({});
  let [variants, setVariants] = useState([]);
  let [starData, setStarData] = useState(["", "", "", "", ""]);
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let [tabView, setTabView] = useState("spec");
  const cartData = useSelector((state) => state.cart);
  let USERDATAref = useRef();
  let [size, setSize] = useState("");
  let [bought, setBought] = useState(false);
  let [review, setReviewed] = useState(false);
  let [qty, setQty] = useState(1);
  let [outOfStock, setOutOfStock] = useState(false);

  useEffect(() => {
    if (!itemCode) {
      // console.log("yes");
      navigate("/shop");
    }
  }, [itemCode]);

  useEffect(() => {
    USERDATAref.current = USERDATA;
  }, [USERDATA]);

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

  let [imageCarousel, setImageCarousel] = useState([]);
  let [currImage, setCurrImage] = useState("");

  // let imageCarousel = [
  //   "665805704b6133abb2617031-1.png",
  //   "665805704b6133abb2617031-2.png",
  //   "665805704b6133abb2617031-3.png",
  //   "665805704b6133abb2617031-4.png",
  // ];

  useEffect(() => {
    (async () => {
      if (rawProductData?.variants) {
        let final = [];
        for (let el of rawProductData?.variants) {
          // for (let el2 of el.variants) {
          let data = await axios.post(`${CONSTANTS.ip}/api/getVariantData`, {
            id: el.variant,
          });

          if (data.data.status === "ok") {
            let fData = {
              id: el.variant,
              variantName: el.variantName,
              variants: [],
            };

            for (let el2 of data.data.variants.variants) {
              let data = await axios.post(`${CONSTANTS.ip}/api/getImageList`, {
                productId: el2.id,
              });
              if (data.data.status === "ok") {
                // console.log(data.data);
                fData.variants.push({
                  id: el2.id,
                  label: el2.label,
                  images: data.data.images,
                });
                // el2["images"] = data.data.images;
              }
            }

            final.push(fData);
          }
        }

        setVariants(final);
      }
    })();
  }, [rawProductData?.variants]);

  useEffect(() => {
    setCurrImage(imageCarousel[0]);
  }, [imageCarousel]);

  useEffect(() => {
    (async () => {
      let data = await axios.post(`${CONSTANTS.ip}/api/getProductData`, {
        productId: itemCode,
      });
      if (data.data.status === "ok") {
        setRawProductData(data.data.product);
        setStar(data.data.product.totalrating);
        setImageCarousel(data.data.product.images);
      } else {
      }
    })();
  }, [itemCode]);

  useEffect(() => {
    (async () => {
      if (!USERDATA._id) return;
      let data = await axios.post(`${CONSTANTS.ip}/api/checkIfBought`, {
        productId: itemCode,
      });

      if (data.data.status === "ok") {
        setBought(data.data.bought);
      }
    })();
  }, [itemCode, USERDATA]);

  useEffect(() => {
    if (rawProductData.sizes) {
      let x = rawProductData.sizes.filter((el) => el.qty !== 0);
      if (x.length > 0) {
        setSize(x[0].name);
      }
    }
  }, [rawProductData.sizes]);

  useEffect(() => {
    if (!USERDATA._id && !rawProductData?.ratings) {
      return;
    }

    let filter = rawProductData?.ratings?.filter(
      (el) => el.postedby === USERDATA._id,
    );

    if (!filter) return;

    if (filter.length > 0) {
      setReviewed(true);
    } else {
      setReviewed(false);
    }
  }, [rawProductData, USERDATA]);

  useEffect(() => {
    if (rawProductData?.sizes?.length === 0) {
      if (rawProductData?.quantity === 0) {
        setOutOfStock(true);
      }
    } else {
      let x = rawProductData?.sizes?.filter((el) => el.qty > 0);
      if (x?.length === 0) {
        setOutOfStock(true);
      }
    }
  }, [rawProductData]);

  async function addToCartHandler() {
    if (outOfStock) return;

    if (!USERDATA._id) {
      if (rawProductData.sizes.length === 0) {
        //no sizes handler
        let quantity =
          qty > rawProductData.quantity ? rawProductData.quantity : qty;

        if (qty > rawProductData.quantity) {
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
          (el) => el.productId === rawProductData._id && el.size === size,
        );
        if (x.length > 0) {
          cart = cart.map((el) => {
            if (el.productId === rawProductData._id && el.size === size) {
              let finalQty =
                el.qty + quantity > rawProductData.quantity
                  ? rawProductData.quantity
                  : el.qty + quantity;
              if (el.qty + quantity > rawProductData.quantity) {
                dispatch(
                  notificationsAction.setNotification({
                    type: "cartAdd",
                    color: "yellow",
                    message: "Maximum quantity reached",
                  }),
                );
              }
              return {
                productId: rawProductData._id,
                qty: finalQty,
                size: el.size,
              };
            }
            return el;
          });
        } else {
          cart.push({
            productId: rawProductData._id,
            qty: quantity,
            size: size,
          });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        dispatch(cartAction.loadCart(cart));
        dispatch(
          notificationsAction.setNotification({
            type: "cartAdd",
            color: "green",
            message: "Item added to Cart",
          }),
        );

        return;
      } else {
        //sizes handler
        let maxQty = rawProductData.sizes.filter((el) => el.name === size)[0]
          .qty;
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
          (el) => el.productId === rawProductData._id && el.size === size,
        );
        if (x.length > 0) {
          cart = cart.map((el) => {
            if (el.productId === rawProductData._id && el.size === size) {
              let quantity = el.qty + qty > maxQty ? maxQty : el.qty + qty;

              if (el.qty + qty > maxQty) {
                dispatch(
                  notificationsAction.setNotification({
                    type: "cartAdd",
                    color: "yellow",
                    message: "Maximum quantity reached",
                  }),
                );
              }

              return {
                productId: rawProductData._id,
                qty: quantity,
                size: el.size,
              };
            }
            return el;
          });
        } else {
          cart.push({
            productId: rawProductData._id,
            qty: quantity,
            size: size,
          });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        dispatch(cartAction.loadCart(cart));
        dispatch(
          notificationsAction.setNotification({
            type: "cartAdd",
            color: "green",
            message: "Item added to Cart",
          }),
        );

        return;
      }
    }

    //if userdata exists

    if (rawProductData.sizes.length === 0) {
      //no sizes handler
      let quantity =
        qty > rawProductData.quantity ? rawProductData.quantity : qty;

      if (qty > rawProductData.quantity) {
        dispatch(
          notificationsAction.setNotification({
            type: "cartAdd",
            color: "yellow",
            message: "Maximum quantity reached",
          }),
        );
      }

      // let cart = JSON.parse(localStorage.getItem("cart"));
      let cart;
      let x = cartData.filter(
        (el) => el.productId === rawProductData._id && el.size === size,
      );
      if (x.length > 0) {
        // cart = cart.map((el) => {
        //   if (el.productId === rawProductData._id && el.size === size) {

        if (x[0].qty >= rawProductData.quantity) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum limit reached",
            }),
          );
          return;
        }

        // let finalQty =
        //   x[0].qty + quantity > rawProductData.quantity
        //     ? rawProductData.quantity
        //     : x[0].qty + quantity;
        if (x[0].qty + quantity > rawProductData.quantity) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum quantity reached",
            }),
          );
        }
        // return {
        //   productId: rawProductData._id,
        //   qty: finalQty,
        //   size: x[0].size,
        // };
      } else {
        if (quantity > rawProductData.quantity) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum limit reached",
            }),
          );
        }
        // cart.push({
        //   productId: rawProductData._id,
        //   qty: quantity,
        //   size: size,
        // });
      }
      // localStorage.setItem("cart", JSON.stringify(cart));
      // dispatch(cartAction.loadCart(cart));
      // dispatch(
      //   notificationsAction.setNotification({
      //     type: "cartAdd",
      //     color: "green",
      //     message: "Item added to Cart",
      //   }),
      // );
    } else {
      //sizes handler
      let maxQty = rawProductData.sizes.filter((el) => el.name === size)[0].qty;
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

      // let cart = JSON.parse(localStorage.getItem("cart"));
      let x = cartData.filter(
        (el) => el.productId === rawProductData._id && el.size === size,
      );
      if (x.length > 0) {
        // cart = cart.map((el) => {
        //   if (el.productId === rawProductData._id && el.size === size) {
        let quantity = x[0].qty + qty > maxQty ? maxQty : x[0].qty + qty;

        if (x[0].qty >= rawProductData.quantity) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum limit reached",
            }),
          );
          return;
        }

        if (x[0].qty + qty > maxQty) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum quantity reached",
            }),
          );
        }

        // return {
        //   productId: rawProductData._id,
        //   qty: quantity,
        //   size: x[0].size,
        // };
        //   }
        //   return el;
        // });
      } else {
        if (quantity > rawProductData.quantity) {
          dispatch(
            notificationsAction.setNotification({
              type: "cartAdd",
              color: "yellow",
              message: "Maximum limit reached",
            }),
          );
        }
        // cart.push({
        //   productId: rawProductData._id,
        //   qty: quantity,
        //   size: size,
        // });
      }
      // localStorage.setItem("cart", JSON.stringify(cart));
      // dispatch(cartAction.loadCart(cart));
      // dispatch(
      //   notificationsAction.setNotification({
      //     type: "cartAdd",
      //     color: "green",
      //     message: "Item added to Cart",
      //   }),
      // );
      //
      // return;
    }

    // let cart = cart.map((el) => {
    //   if (el.productId === rawProductData._id && el.size === size) {
    //     let finalQty =
    //         el.qty + quantity > rawProductData.quantity
    //             ? rawProductData.quantity
    //             : el.qty + quantity;

    let data = await axios.post(`${CONSTANTS.ip}/api/addToCart`, {
      productId: itemCode,
      qty: qty,
      size: size,
    });
    if (data.data.status === "ok") {
      dispatch(cartAction.loadCart(data.data.cart));
      dispatch(
        notificationsAction.setNotification({
          type: "cartAdd",
          color: "green",
          message: "Item added to Cart",
        }),
      );
    } else {
      dispatch(
        notificationsAction.setNotification({
          type: "someWrong",
          color: "red",
          message: "Something went wrong",
        }),
      );
    }
  }

  return (
    <div className={"ProductPage"}>
      <div className={"ProductPage-Header"}>
        <p>HOME</p>
        <span>/</span>
        {rawProductData?.hierarchy?.map((el) => {
          return (
            <>
              <p
                onClick={() => {
                  let query = `/shop?query=${el}&page=1&sort=Relevant`;
                  navigate(query);
                }}
              >
                {el}
              </p>
              <span>/</span>
            </>
          );
        })}
        <p className={"final"}>{rawProductData.title}</p>
      </div>
      <div className={"ProductPageWrapper"}>
        <div className={"ProductPage-ImageWrapper"}>
          <div className={"ProductPage-ImageWrapper-Image"}>
            {rawProductData.discount != 0 && (
              <span>SAVE {rawProductData.discount}%</span>
            )}
            <img src={`${CONSTANTS.ip}/productImages/Images/${currImage}`} />
          </div>

          <div className={"ProductPage-ImageWrapper-ImageCarousel"}>
            {imageCarousel.map((el, i) => {
              return (
                <img
                  src={`${CONSTANTS.ip}/productImages/Images/${el}`}
                  style={{
                    transform: `translate(${(i - currSlide) * 100 + (i - currSlide) * 10}% , -50%)`,
                  }}
                  onClick={() => {
                    setCurrImage(el);
                    setCurrSlide(i);
                  }}
                  className={i - currSlide === 0 ? "selectedImage" : ""}
                />
              );
            })}
          </div>
          <div className={"controlCont"}>
            <i
              className="ph-bold ph-caret-left left"
              onClick={() => {
                if (currSlide === 0) {
                  setCurrSlide(imageCarousel.length - 1);
                  setCurrImage(imageCarousel[imageCarousel.length - 1]);
                } else {
                  setCurrSlide((prev) => {
                    setCurrImage(imageCarousel[prev - 1]);
                    return prev - 1;
                  });
                }
              }}
            ></i>
            <i
              className="ph-bold ph-caret-right right"
              onClick={() => {
                if (currSlide === imageCarousel.length - 1) {
                  setCurrSlide(0);
                  setCurrImage(imageCarousel[0]);
                } else {
                  setCurrSlide((prev) => {
                    setCurrImage(imageCarousel[prev + 1]);
                    return prev + 1;
                  });
                  // setCurrImage(imageCarousel[currSlide]);
                }
              }}
            ></i>
          </div>
        </div>
        <div className={"ProductPage-Content"}>
          <div
            className={"ProductPage-Content-Cont borderBottom"}
            style={{ paddingTop: "0" }}
          >
            <div className={"ProductPage-Content-Cont-HeaderWrapper"}>
              <div className={"ProductPage-Content-Cont-HeaderWrapper-Header"}>
                <h2>{rawProductData.title}</h2>
                <p>By {rawProductData.brand}</p>
              </div>

              <div className={"ProductPage-Content-Cont-HeaderWrapper-Star"}>
                {starData.map((el, i) => {
                  return (
                    <i
                      className={`ph-fill ph-star${el === "half" ? "-half" : ""}`}
                      style={el !== "" ? { color: "#ffc300" } : {}}
                    ></i>
                  );
                })}
                <span>
                  {rawProductData?.ratings?.length}
                  {rawProductData?.ratings?.length !== 1
                    ? " Reviews"
                    : " Review"}
                </span>
              </div>

              <p className={"description"}>{rawProductData.description}</p>

              <div className="ProductPage-Content-Cont-Price">
                <h2>
                  ₹
                  {rawProductData.discount === 0
                    ? rawProductData.mrp.toFixed(2)
                    : (
                        rawProductData.mrp -
                        rawProductData.mrp * (rawProductData.discount / 100)
                      ).toFixed(2)}
                </h2>
                {rawProductData.discount != 0 && (
                  <div className={"mrpCont"}>
                    <span>₹{rawProductData.mrp?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/*{outOfStock && (*/}
              {/*  <div className={"outOfStock-Text"}>*/}
              {/*    <i className="ph-bold ph-x"></i>*/}
              {/*    <p>Out of Stock</p>*/}
              {/*  </div>*/}
              {/*)}*/}
            </div>
          </div>

          <div className={"ProductPage-Content-Cont borderBottom"}>
            <div className={"ProductPage-Content-Cont-Variants-Wrapper"}>
              {variants.map((el, i) => {
                return (
                  <div className={"ProductPage-Content-Cont-Variants"}>
                    <h2>{el.variantName}</h2>
                    <div className={"ProductPage-Content-Cont-Variants-Types"}>
                      {el.variants.map((el2) => {
                        return (
                          <img
                            src={`${CONSTANTS.ip}/productImages/Images/${el2.images[0]}`}
                            className={itemCode === el2.id ? "selected" : ""}
                            onClick={() => {
                              navigate("/product?productNo=" + el2.id);
                              setItemCode(el2.id);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {rawProductData?.sizes?.length > 0 && (
                <div className={"ProductPage-Content-Cont-Variants"}>
                  <h2>Size</h2>
                  <div className={"ProductPage-Content-Cont-Variants-Types"}>
                    {rawProductData?.sizes?.map((el, i) => {
                      return (
                        <p
                          className={
                            el.qty === 0
                              ? "outOfStock"
                              : size === el.name
                                ? "selected"
                                : ""
                          }
                          onClick={() => {
                            if (el.qty > 0) {
                              setSize(el.name);
                            }
                          }}
                        >
                          {el.name}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                className="ButtonWrapper"
                style={
                  rawProductData?.sizes?.length === 0 ? { marginTop: 0 } : {}
                }
              >
                <div className={"BtnRow"}>
                  <div className="Btn qtyBtn">
                    <i
                      className="ph-bold ph-minus"
                      onClick={() => {
                        if (qty > 1) {
                          setQty((prev) => prev - 1);
                        }
                      }}
                    ></i>
                    <p className="qtyCounter">{qty}</p>
                    <i
                      className="ph-bold ph-plus"
                      onClick={() => {
                        if (qty < rawProductData.quantity) {
                          setQty((prev) => prev + 1);
                        }
                      }}
                    ></i>
                  </div>

                  <i className="ph-fill ph-heart Wishlist"></i>
                </div>

                <div className={"BtnRow"}>
                  <div
                    className={`Btn addCartBtn ${outOfStock ? "outOfStockBtn" : ""}`}
                    onClick={addToCartHandler}
                  >
                    <i
                      className={`ph-bold ${!outOfStock ? "ph-shopping-cart" : "ph-x"}`}
                    ></i>
                    <p className="cartCounter">
                      {!outOfStock ? "Add to Cart" : "Out of Stock"}
                    </p>
                  </div>
                  {/*<div className="Wishlist">*/}
                  {/*<i className="ph-fill ph-heart Wishlist"></i>*/}
                  {/*</div>*/}
                </div>
              </div>
            </div>
          </div>
          <div className={`TabView ${tabView}`}>
            <div
              className={`Option ${tabView === "spec" ? "selected" : ""}`}
              onClick={() => setTabView("spec")}
            >
              <h2>Specification</h2>
            </div>
            <div
              className={`Option ${tabView === "reviews" ? "selected" : ""}`}
              onClick={() => setTabView("reviews")}
            >
              <h2>Reviews</h2>
            </div>
          </div>
          {/*{rawProductData?.specification?.length > 0 && (*/}
          {tabView === "spec" && (
            <div className={"ProductPage-Content-Cont borderBottom"}>
              <div className={"ProductPage-Content-Cont-Specifications"}>
                {rawProductData?.specification?.length === 0 && (
                  <h2 className={"fault"}>
                    No Specification data given for the product
                  </h2>
                )}
                {rawProductData?.specification?.length > 0 && (
                  <div
                    className={"ProductPage-Content-Cont-Specifications-Table"}
                  >
                    {rawProductData.specification.map((el) => (
                      <div className={"row"}>
                        <p>{el.label}</p>
                        <span>{el.data}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {tabView === "reviews" && (
            <Reviews productId={itemCode} bought={bought} review={review} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
