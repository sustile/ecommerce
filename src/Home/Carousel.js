import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Carousel(props) {
  let [currSlide, setCurrSlide] = React.useState(0);
  let currSlideRef = useRef();
  let dispatch = useDispatch();
  let navigate = useNavigate();
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let USERDATA = useSelector((state) => state.USERDATA);
  let [images, setImages] = useState([]);
  let imageRef = useRef();
  let interval = useRef();

  useEffect(() => {
    currSlideRef.current = currSlide;
    imageRef.current = images;
  }, [currSlide, images]);

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getCarousel`);
      if (data.data.status === "ok") {
        console.log(data.data.carousel.images);
        setImages(data.data.carousel.images);
      } else {
      }
    })();
  }, []);

  useEffect(() => {
    interval.current = setInterval(() => {
      if (currSlideRef.current === imageRef.current.length - 1) {
        setCurrSlide(0);
      } else {
        setCurrSlide((prev) => {
          return prev + 1;
        });
      }
    }, 5 * 1000);
  }, []);

  return (
    <div className={"Carousel"}>
      <div className={"Carousel-Image"}>
        {images.map((el, i) => {
          return (
            <motion.img
              src={`${CONSTANTS.ip}/carouselImages/Main/${el.link}`}
              style={{
                transform: `translate(${(i - currSlide) * 100 - 50 + (i - currSlide < 0 ? 1 : i - currSlide > 0 ? -1 : 0)}% , -50%) scale(${i === currSlide ? "1" : "0.9"})`,
              }}
              onClick={() => {
                if (currSlide === i) {
                  window.location.href = el.url;
                  return;
                }

                clearInterval(interval.current);
                setCurrSlide(i);
                interval.current = setInterval(() => {
                  if (currSlideRef.current === imageRef.current.length - 1) {
                    setCurrSlide(0);
                  } else {
                    setCurrSlide((prev) => {
                      return prev + 1;
                    });
                  }
                }, 5 * 1000);
              }}
              // onHoverStart={() => {
              //   clearInterval(interval.current);
              // }}
              // onHoverEnd={() => {
              //   interval.current = setInterval(() => {
              //     if (currSlideRef.current === images.length - 1) {
              //       setCurrSlide(0);
              //     } else {
              //       setCurrSlide((prev) => {
              //         return prev + 1;
              //       });
              //     }
              //   }, 5 * 1000);
              // }}
              // whileHover={{
              //   transform: `translate(${(i - currSlide) * 100 - 50}% , -50%) scale(1.15)`,
              //   transition: {
              //     duration: 0.3,
              //   },
              // }}
            />
          );
        })}
      </div>
      <div className={"Carousel-dots-cont"}>
        {images.map((el, i) => (
          <div
            className={`carousel-dots ${currSlide === i ? "active" : ""}`}
            onClick={() => {
              clearInterval(interval.current);
              setCurrSlide(i);
              interval.current = setInterval(() => {
                if (currSlideRef.current === imageRef.current.length - 1) {
                  setCurrSlide(0);
                } else {
                  setCurrSlide((prev) => {
                    return prev + 1;
                  });
                }
              }, 5 * 1000);
            }}
          ></div>
        ))}
      </div>
      {/*<i*/}
      {/*  className="ph-bold ph-arrow-left arrow left"*/}
      {/*  onClick={() => {*/}
      {/*    clearInterval(interval.current);*/}
      {/*    if (currSlide === 0) {*/}
      {/*      setCurrSlide(images.length - 1);*/}
      {/*    } else {*/}
      {/*      setCurrSlide((prev) => prev - 1);*/}
      {/*    }*/}
      {/*    interval.current = setInterval(() => {*/}
      {/*      if (currSlideRef.current === images.length - 1) {*/}
      {/*        setCurrSlide(0);*/}
      {/*      } else {*/}
      {/*        setCurrSlide((prev) => {*/}
      {/*          return prev + 1;*/}
      {/*        });*/}
      {/*      }*/}
      {/*    }, 5 * 1000);*/}
      {/*  }}*/}
      {/*></i>*/}
      {/*<i*/}
      {/*  className="ph-bold ph-arrow-right arrow right"*/}
      {/*  onClick={() => {*/}
      {/*    clearInterval(interval.current);*/}
      {/*    if (currSlide === images.length - 1) {*/}
      {/*      setCurrSlide(0);*/}
      {/*    } else {*/}
      {/*      setCurrSlide((prev) => prev + 1);*/}
      {/*    }*/}
      {/*    interval.current = setInterval(() => {*/}
      {/*      if (currSlideRef.current === images.length - 1) {*/}
      {/*        setCurrSlide(0);*/}
      {/*      } else {*/}
      {/*        setCurrSlide((prev) => {*/}
      {/*          return prev + 1;*/}
      {/*        });*/}
      {/*      }*/}
      {/*    }, 5 * 1000);*/}
      {/*  }}*/}
      {/*></i>*/}
    </div>
  );
}

export default Carousel;
