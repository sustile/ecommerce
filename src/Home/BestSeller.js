import React, { useEffect, useState } from "react";
import "./Home.css";
import ProductCard from "../Components/ProductSearch/ProductCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesAction } from "../Store/store";

function BestSeller(props) {
  let [rawProducts, setRawProducts] = useState([]);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let navigate = useNavigate();
  let dispatch = useDispatch();

  useEffect(() => {
    const slider = document.querySelector(".BestSeller-Cont");
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    });
  }, []);

  useEffect(() => {
    (async () => {
      let data = await axios.get(`${CONSTANTS.ip}/api/getBestSellers`);
      if (data.data.status === "ok") {
        setRawProducts(data.data.result);
      }
    })();
  }, []);

  return (
    <div className={"BestSeller"}>
      <div className={"BestSeller-Header"}>
        <h2 className={"mainHeader"}>
          Best <span>Seller.</span>
        </h2>
        <h2 className={"bgHeader"}>Best Seller</h2>
        <p
          onClick={() => {
            dispatch(categoriesAction.setState("Best Sellers"));
            let query = `/shop?query=${"Best Sellers"}&page=1&sort=Relevant`;
            navigate(query);
          }}
        >
          See All
        </p>
      </div>
      <div className={"BestSeller-Cont"}>
        {rawProducts.map((el) => (
          <ProductCard data={el} lineClamp={1} carousel={true} />
        ))}
      </div>
    </div>
  );
}

export default BestSeller;
