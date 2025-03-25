import React, { useEffect, useRef, useState } from "react";
import "./ProductSearch.css";
import ProductCard from "./ProductCard";
import Slider from "react-slider";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addressAction,
  cartAction,
  UserDataActions,
  wishlistAction,
} from "../../Store/store";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const totalElementsPerPage = 10;

function ProductSearch(props) {
  let min = "";
  let max = "";
  const [values, setValues] = useState([min, max]);
  // let [page, setPage] = useState(1);
  let [rawProducts, setRawProducts] = useState([]);
  let pageRef = useRef();
  let valuesRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  let [search, setSearch] = useState(
    searchParams.get("query") ? searchParams.get("query") : ""
  );
  let [sort, setSort] = useState(
    searchParams.get("sort") ? searchParams.get("sort") : "Relevant"
  );
  let [originalLength, setOriginalLength] = useState(0);
  let [page, setPage] = useState(
    searchParams.get("page") >= 1 ? Number(searchParams.get("page")) : 1
  );
  let [highest, setHighest] = useState(0);
  let [lowest, setLowest] = useState(0);
  let navigate = useNavigate();
  let [totalPage, setTotalPage] = useState(0);
  let [pagination, setPagination] = useState([]);
  let [paginationEnd, setPaginationEnd] = useState(false);
  let [stockFilter, setStockFilter] = useState({
    inStock: true,
    outStock: true,
  });
  let stockFilterRef = useRef();
  useEffect(() => {
    let final = [];
    if (page + 4 < totalPage) {
      setPaginationEnd(false);
      for (let i = page; i < page + 4; i++) {
        final.push(i);
      }
    } else {
      setPaginationEnd(true);
      let lowerLimit = totalPage - 4 < 1 ? 1 : totalPage - 4;
      for (let i = lowerLimit; i < totalPage; i++) {
        final.push(i);
      }
    }
    setPagination(final);
  }, [page, totalPage]);

  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);

  useEffect(() => {
    pageRef.current = page;
    valuesRef.current = values;
    stockFilterRef.current = stockFilter;
  }, [page, values, stockFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    let query = `/shop?query=${search}&page=${page}&sort=${sort}`;
    navigate(query);
  }, [sort, page]);

  useEffect(() => {
    (async () => {
      if (!search) return;
      // let priceRange = [
      //   Number(searchParams.get("min")),
      //   Number(searchParams.get("max")),
      // ];
      // console.log(priceRange);
      let data = await axios.post(`${CONSTANTS.ip}/api/lazyLoadProducts`, {
        query: search,
        page: page,
        sort: sort,
        priceRange: valuesRef.current,
        stockFilter: stockFilterRef.current,
      });
      if (data.data.status === "ok") {
        setOriginalLength(data.data.length);
        let x = Math.ceil(data.data.length / totalElementsPerPage);
        setTotalPage(x);
        // setLowest(Math.floor(data.data.lowest));
        // setHighest(Math.ceil(data.data.highest));
        if (valuesRef?.current[0] === "" && valuesRef?.current[1] === "") {
          setLowest(Math.floor(data.data.lowest));
          setHighest(Math.ceil(data.data.highest));
          setValues([
            Math.floor(data.data.lowest),
            Math.ceil(data.data.highest),
          ]);
        } //   setValues(data.data.priceRange);
        // }
        setRawProducts(data.data.result);
      }
    })();
  }, [page]);

  useEffect(() => {
    setSearch(searchParams.get("query"));
    if (searchParams.get("query") === "") {
      window.location.href = "/home";
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      if (!search) return;
      setPage(1);
      setValues([min, max]);
      setSort("Relevant");

      let data = await axios.post(`${CONSTANTS.ip}/api/lazyLoadProducts`, {
        query: search,
        page: 1,
        sort: sort,
        priceRange: ["", ""],
        stockFilter: stockFilterRef.current,
      });
      if (data.data.status === "ok") {
        setOriginalLength(data.data.length);
        let x = Math.ceil(data.data.length / totalElementsPerPage);
        setTotalPage(x);
        setStockFilter({ inStock: true, outStock: true });
        // setLowest(Math.floor(data.data.lowest));
        // setHighest(Math.ceil(data.data.highest));
        if (valuesRef?.current[0] === "" && valuesRef?.current[1] === "") {
          setLowest(Math.floor(data.data.lowest));
          setHighest(Math.ceil(data.data.highest));
          setValues([
            Math.floor(data.data.lowest),
            Math.ceil(data.data.highest),
          ]);
        } //   setValues(data.data.priceRange);
        // }
        setRawProducts(data.data.result);
      }
    })();
  }, [search]);

  useEffect(() => {
    (async () => {
      if (!search) return;
      // let priceRange = [
      //   Number(searchParams.get("min")),
      //   Number(searchParams.get("max")),
      // ];
      // console.log(priceRange);
      let data = await axios.post(`${CONSTANTS.ip}/api/lazyLoadProducts`, {
        query: search,
        page: page,
        sort: sort,
        priceRange: valuesRef.current,
        stockFilter: stockFilterRef.current,
      });
      if (data.data.status === "ok") {
        setOriginalLength(data.data.length);
        let x = Math.ceil(data.data.length / totalElementsPerPage);
        setTotalPage(x);
        // setLowest(Math.floor(data.data.lowest));
        // setHighest(Math.ceil(data.data.highest));
        // if (valuesRef?.current[0] === "" && valuesRef?.current[1] === "") {
        // setValues([Math.floor(data.data.lowest), Math.ceil(data.data.highest)]);
        // } else {
        //   setValues(data.data.priceRange);
        // }
        setRawProducts(data.data.result);
      }
    })();
  }, [sort]);

  async function filterChangeHandler() {
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!search) return;
    (async () => {
      let data = await axios.post(`${CONSTANTS.ip}/api/lazyLoadProducts`, {
        query: search,
        page: 1,
        sort: sort,
        priceRange: valuesRef.current,
        stockFilter: stockFilterRef.current,
      });
      if (data.data.status === "ok") {
        setOriginalLength(data.data.length);
        let x = Math.ceil(data.data.length / totalElementsPerPage);
        setTotalPage(x);
        // setLowest(data.data.lowest);
        // setHighest(data.data.highest);
        // setValues([data.data.lowest, data.data.highest]);
        setRawProducts(data.data.result);
      }
    })();
  }

  return (
    <div className="ProductSearch">
      <div className="ProductSearchWrapper">
        <div className="ProductSearchHeader">
          <h2>{search}</h2>
        </div>
        <div className="ProductSearchContainer">
          <div className="ProductSearchFilterWrapper">
            {/* <div className="FilterCategory">
              <div className="FilterCategory-Header">
                <h2>SHOP BY CATEGORY</h2>
              </div>
              <div className="FilterCategory-Content">
                <div className="Element">
                  <p>Fiber Laser Cutting Machine</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
                <div className="Element">
                  <p>ARC Welding Machine</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
                <div className="Element">
                  <p>Laser Cutting Machines</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
                <div className="Element">
                  <p>Welding Accessories</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
                <div className="Element">
                  <p>Inverter Welding Machine</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
                <div className="Element">
                  <p>Welding Machine</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
                <div className="Element">
                  <p>Lorch MIG Welding Machine</p>
                  <i className="ph-bold ph-caret-right"></i>
                </div>
              </div>
            </div> */}
            <div className="FilterCategory">
              <div className="FilterCategory-Header">
                <h2>FILTER BY PRICE</h2>
              </div>

              <div className="FilterCategory-Filter">
                <Slider
                  className={"slider"}
                  value={values}
                  min={lowest}
                  max={highest}
                  onChange={setValues}
                  minDistance={1}
                />

                {/*<div className="FilterCategory-Filter-Input">*/}
                {/*  <div className="Element">*/}
                {/*    <p>Min</p>*/}
                {/*    <input*/}
                {/*      placeholder="Min"*/}
                {/*      type="number"*/}
                {/*      min={lowest}*/}
                {/*      max={highest}*/}
                {/*      value={values[0]}*/}
                {/*    />*/}
                {/*  </div>*/}
                {/*  <div className="Element">*/}
                {/*    <p>Max</p>*/}
                {/*    <input*/}
                {/*      placeholder="Max"*/}
                {/*      type="number"*/}
                {/*      min={lowest}*/}
                {/*      max={highest}*/}
                {/*      value={values[1]}*/}
                {/*    />*/}
                {/*  </div>*/}
                {/*</div>*/}
                <p>
                  Price Range: {values[0]}₹ to {values[1]}₹
                </p>
                <button className="btn" onClick={filterChangeHandler}>
                  Filter
                </button>
              </div>
            </div>

            <div className="FilterCategory">
              <div className="FilterCategory-Header">
                <h2>FILTER BY STOCK</h2>
              </div>

              <div className="FilterCategory-Filter">
                <div className={"FilterCategory-Filter-CheckboxWrapper"}>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      name="cb"
                      id="inStock"
                      checked={stockFilter.inStock}
                      onChange={(e) => {
                        setStockFilter((prev) => {
                          return { ...prev, inStock: !prev.inStock };
                        });
                      }}
                    />
                    <label htmlFor="inStock">In Stock</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      name="cb"
                      id="outStock"
                      checked={stockFilter.outStock}
                      onChange={(e) => {
                        setStockFilter((prev) => {
                          return { ...prev, outStock: !prev.outStock };
                        });
                      }}
                    />
                    <label htmlFor="outStock">Out of Stock</label>
                  </div>
                </div>

                <button className="btn" onClick={filterChangeHandler}>
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="ProductSearchMainWrapper">
            <div className="ProductSearch-Sort">
              <div className="ProductSearch-Sort-Header">
                <h2>
                  showing {totalElementsPerPage * (page - 1) + 1}-
                  {totalElementsPerPage * page > originalLength
                    ? originalLength
                    : totalElementsPerPage * page}{" "}
                  of {originalLength} results
                </h2>
              </div>
              <div className="ProductSearch-Sort-Content">
                <h2>SORT BY</h2>
                <div className="ProductSearch-Sort-Content-Main">
                  <div
                    className={`Element`}
                    onClick={() => {
                      setPage(1);
                      setSort("Relevant");
                    }}
                  >
                    <p>Relevant</p>
                    <AnimatePresence>
                      {sort === "Relevant" && (
                        <motion.div
                          animate={{
                            width: "100%",
                            transition: { type: "spring", duration: 0.3 },
                          }}
                          exit={{
                            width: "0%",
                            // transition: { type: "spring", duration: 0.5 },
                          }}
                          className={"bottom-bar"}
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div
                    className={`Element`}
                    onClick={() => {
                      setPage(1);
                      setSort("NameAsc");
                    }}
                  >
                    <p>Name (A-Z)</p>
                    <AnimatePresence>
                      {sort === "NameAsc" && (
                        <motion.div
                          animate={{
                            width: "100%",
                            transition: { type: "spring", duration: 0.3 },
                          }}
                          exit={{
                            width: "0%",
                            // transition: { type: "spring", duration: 0.5 },
                          }}
                          className={"bottom-bar"}
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div
                    className={`Element `}
                    onClick={() => {
                      setPage(1);
                      setSort("NameDesc");
                    }}
                  >
                    <p>Name (Z-A)</p>
                    <AnimatePresence>
                      {sort === "NameDesc" && (
                        <motion.div
                          animate={{
                            width: "100%",
                            transition: { type: "spring", duration: 0.3 },
                          }}
                          exit={{
                            width: "0%",
                            // transition: { type: "spring", duration: 0.5 },
                          }}
                          className={"bottom-bar"}
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div
                    className={`Element`}
                    onClick={() => {
                      setPage(1);
                      setSort("PriceDesc");
                    }}
                  >
                    <p>Price (High to Low)</p>
                    <AnimatePresence>
                      {sort === "PriceDesc" && (
                        <motion.div
                          animate={{
                            width: "100%",
                            transition: { type: "spring", duration: 0.3 },
                          }}
                          exit={{
                            width: "0%",
                            // transition: { type: "spring", duration: 0.5 },
                          }}
                          className={"bottom-bar"}
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div
                    className={`Element`}
                    onClick={() => {
                      setPage(1);
                      setSort("PriceAsc");
                    }}
                  >
                    <p>Price (Low to High)</p>
                    <AnimatePresence>
                      {sort === "PriceAsc" && (
                        <motion.div
                          animate={{
                            width: "100%",
                            transition: { type: "spring", duration: 0.3 },
                          }}
                          exit={{
                            width: "0%",
                            // transition: { type: "spring", duration: 0.5 },
                          }}
                          className={"bottom-bar"}
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            <div className="ProductSearch-Main">
              {rawProducts.map((el) => (
                <ProductCard data={el} key={el._id} />
              ))}
            </div>
            {rawProducts.length === 0 && (
              <h2 className={"noProductsFound"}>No Results found</h2>
            )}

            {rawProducts.length > 0 && (
              <div className={"ProductSearch-Pagination"}>
                <button
                  onClick={() => {
                    if (page > 1) {
                      setPage((prev) => prev - 1);
                    }
                  }}
                >
                  <i className="ph-bold ph-caret-left"></i>
                  <p>Prev</p>
                </button>
                {pagination.map((el) => (
                  <p
                    className={`pageBtns ${el === page ? "selectedPage" : ""}`}
                    onClick={() => setPage(el)}
                  >
                    {el}
                  </p>
                ))}
                {!paginationEnd && <p>...</p>}
                <p
                  className={`pageBtns ${
                    totalPage === page ? "selectedPage" : ""
                  }`}
                  onClick={() => setPage(totalPage)}
                >
                  {totalPage}
                </p>
                <button
                  className={"nextBtn"}
                  onClick={() => {
                    if (page < totalPage) {
                      setPage((prev) => prev + 1);
                    }
                  }}
                >
                  <p>Next</p>
                  <i className="ph-bold ph-caret-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSearch;
