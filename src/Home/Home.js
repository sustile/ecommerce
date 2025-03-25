import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import Slider from "react-slider";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Carousel from "./Carousel";
import BestSeller from "./BestSeller";
import Deals from "./Deals";
import { categoriesAction } from "../Store/store";
import Footer from "../Components/Footer/Footer";

const totalElementsPerPage = 10;

function Home(props) {
  let categories = useSelector((state) => state.categories);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let dispatch = useDispatch();
  let [banners, setBanners] = useState([]);
  let navigate = useNavigate();

  console.log(banners);

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getMainBanners`);
      if (data.data.status === "ok") {
        setBanners(data.data.banner);
      } else {
      }
    })();
  }, []);

  return (
    <>
      <div className={"Home"}>
        <Carousel />
        <div className={"CategoriesInter"}>
          <div className={"CategoriesInter-Header"}>
            <h2 className={"mainHeader"}>
              Shop By <span>Category.</span>
            </h2>
            <h2 className={"bgHeader"}>Category</h2>
          </div>
          <div className={"CategoriesInter-Cont"}>
            {categories.categories.map((el) => (
              <div
                className={"Option"}
                onClick={() => {
                  dispatch(categoriesAction.setState(el.title));
                  let query = `/shop?query=${el.title}&page=1&sort=Relevant`;
                  navigate(query);
                }}
              >
                <img src={`./Assets/Images/Categories/${el.images[0]}`} />
                <p>{el.title}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={"BannersCont"}>
          <div className={"Banner-Row"} style={{ gridRow: "1/3" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[0]?.images[0]?.link}`}
                onClick={() => {
                  window.location.href = banners[0]?.images[0]?.url;
                }}
              />
            </div>
          </div>
          <div className={"Banner-Row"} style={{ gridRow: "1/3" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[0]?.images[1]?.link}`}
                onClick={() => {
                  window.location.href = banners[0]?.images[1]?.url;
                }}
              />
            </div>
          </div>
          <div
            className={"Banner-Column"}
            style={{ gridColumn: "3/5", gridRow: "1/3" }}
          >
            <div className={"ColumnElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[0]?.images[2]?.link}`}
                onClick={() => {
                  window.location.href = banners[0]?.images[2]?.url;
                }}
              />
            </div>
            <div className={"Banner-Row"}>
              <div className={"RowElement"}>
                <img
                  src={`${CONSTANTS.ip}/bannerImages/Main/${banners[0]?.images[3]?.link}`}
                  onClick={() => {
                    window.location.href = banners[0]?.images[3]?.url;
                  }}
                />
              </div>
              <div className={"RowElement"}>
                <img
                  src={`${CONSTANTS.ip}/bannerImages/Main/${banners[0]?.images[4]?.link}`}
                  onClick={() => {
                    window.location.href = banners[0]?.images[4]?.url;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={"gap"} style={{ width: "100%", padding: "4rem" }}></div>
        <BestSeller />

        <div className={"BannersCont"}>
          <div className={"Banner-Row"} style={{ gridColumn: "1/5" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[1]?.images[0]?.link}`}
                onClick={() => {
                  window.location.href = banners[1]?.images[0]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[1]?.images[1]?.link}`}
                onClick={() => {
                  window.location.href = banners[1]?.images[1]?.url;
                }}
              />
            </div>
          </div>
          <div className={"Banner-Row"} style={{ gridColumn: "1/5" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[1]?.images[2]?.link}`}
                onClick={() => {
                  window.location.href = banners[1]?.images[2]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[1]?.images[3]?.link}`}
                onClick={() => {
                  window.location.href = banners[1]?.images[3]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[1]?.images[4]?.link}`}
                onClick={() => {
                  window.location.href = banners[1]?.images[4]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[1]?.images[5]?.link}`}
                onClick={() => {
                  window.location.href = banners[1]?.images[5]?.url;
                }}
              />
            </div>
          </div>
        </div>
        <div className={"gap"} style={{ width: "100%", padding: "4rem" }}></div>
        <Deals />

        <div className={"BannersCont"}>
          <div className={"Banner-Row"} style={{ gridColumn: "1/5" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[2]?.images[0]?.link}`}
                onClick={() => {
                  window.location.href = banners[2]?.images[0]?.url;
                }}
              />
            </div>
          </div>
          <div className={"Banner-Row"} style={{ gridColumn: "1/5" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[2]?.images[1]?.link}`}
                onClick={() => {
                  window.location.href = banners[2]?.images[1]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[2]?.images[2]?.link}`}
                onClick={() => {
                  window.location.href = banners[2]?.images[2]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[2]?.images[3]?.link}`}
                onClick={() => {
                  window.location.href = banners[2]?.images[3]?.url;
                }}
              />
            </div>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[2]?.images[4]?.link}`}
                onClick={() => {
                  window.location.href = banners[2]?.images[4]?.url;
                }}
              />
            </div>
          </div>
        </div>

        <div className={"BannersCont"}>
          <div className={"Banner-Row"} style={{ gridColumn: "1/3" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[3]?.images[0]?.link}`}
                onClick={() => {
                  window.location.href = banners[3]?.images[0]?.url;
                }}
              />
            </div>
          </div>
          <div className={"Banner-Row"} style={{ gridColumn: "3/5" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[3]?.images[1]?.link}`}
                onClick={() => {
                  window.location.href = banners[3]?.images[1]?.url;
                }}
              />
            </div>
          </div>
          <div className={"Banner-Row"} style={{ gridColumn: "1/3" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[3]?.images[2]?.link}`}
                onClick={() => {
                  window.location.href = banners[3]?.images[2]?.url;
                }}
              />
            </div>
          </div>
          <div className={"Banner-Row"} style={{ gridColumn: "3/5" }}>
            <div className={"RowElement"}>
              <img
                src={`${CONSTANTS.ip}/bannerImages/Main/${banners[3]?.images[3]?.link}`}
                onClick={() => {
                  window.location.href = banners[3]?.images[3]?.url;
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={"gap"} style={{ width: "100%", padding: "4rem" }}></div>
      <Footer />
    </>
  );
}

export default Home;
