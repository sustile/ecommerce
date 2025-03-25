import React, { useEffect, useReducer, useState } from "react";
import "./ProductPage.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { categoriesAction, notificationsAction } from "../Store/store";

const intialFormState = {
  pass: "",
  passIsValid: false,
  email: "",
  emailIsValid: false,
  formIsValid: false,
};

const formReducer = (state, action) => {
  if (action.type === "EMAIL_CHANGE") {
    if (Number(action.data) > 5) {
      return state;
    }
    let x = Number(action.data) <= 5;
    return {
      ...state,
      email: action.data,
      emailIsValid: x,
      formIsValid: state.passIsValid && x,
    };
  } else if (action.type === "PASS_CHANGE") {
    let x = action.data.length >= 3 && action.data.length <= 1000;
    return {
      ...state,
      pass: action.data,
      passIsValid: x,
      formIsValid: x && state.emailIsValid,
    };
  }
  return intialFormState;
};

function Reviews({ productId, review, bought }) {
  const [formState, dispatchForm] = useReducer(formReducer, intialFormState);
  const CONSTANTS = useSelector((state) => state.CONSTANTS);
  const USERDATA = useSelector((state) => state.USERDATA);
  let [reviewData, setReviewData] = useState([]);
  let [hideReview, setHideReview] = useState(false);

  let dispatch = useDispatch();

  async function formHandler(e) {
    e.preventDefault();

    if (hideReview) return;

    console.log({
      productId,
      review: formState.pass,
      rating: formState.email,
    });

    if (!formState.formIsValid) return;

    let data = await axios.post(`${CONSTANTS.ip}/api/giveReview`, {
      productId,
      review: formState.pass,
      rating: formState.email,
    });

    if (data.data.status === "ok") {
      dispatch(
        notificationsAction.setNotification({
          type: "comment",
          color: "green",
          message: "Thank you for leaving a review",
        }),
      );

      setReviewData((prev) => [...prev, data.data.newReview]);
      setHideReview(true);

      setTimeout(() => {
        window.location.reload();
      }, 3 * 1000);
    } else {
      dispatch(
        notificationsAction.setNotification({
          type: "comment",
          color: "red",
          message: "Something went wrong",
        }),
      );
    }

    console.log(data.data);
  }

  function emailChangeHandler(e) {
    dispatchForm({
      type: "EMAIL_CHANGE",
      data: e.target.value,
    });
  }

  function passChangeHandler(e) {
    dispatchForm({
      type: "PASS_CHANGE",
      data: e.target.value,
    });
  }

  useEffect(() => {
    (async () => {
      let data = await axios.post(`${CONSTANTS.ip}/api/getReviews`, {
        productId,
      });

      if (data.data.status === "ok") {
        console.log(data.data);
        setReviewData(data.data.reviews);

        // setReviewData(data.data.bought);
      }
    })();
  }, []);

  return (
    <div className={"ProductPage-Content-Cont borderBottom"}>
      <div className={"ProductPage-Content-Cont-Specifications"}>
        {reviewData.length === 0 && (
          <h2 className={"fault"}>No Reviews available</h2>
        )}
        {!hideReview && USERDATA._id && !review && bought && (
          <div className={"ProductPage-ReviewForm"}>
            <div className={"ProductPage-ReviewForm-Header"}>
              <h2 className={"fault"}>Looks like you bought this product.</h2>
              <h3>Help others in choosing by leaving a review</h3>
            </div>
            <form
              className={"Login-Wrapper-Content-Form"}
              onSubmit={formHandler}
            >
              <div className={"Login-Wrapper-Content-Form-Input"}>
                <p>Stars</p>
                <input
                  type={"number"}
                  placeholder={"Rating"}
                  required
                  max={"5"}
                  min={"0"}
                  step={"0.1"}
                  onChange={emailChangeHandler}
                  value={formState.email}
                />
              </div>
              <div className={"Login-Wrapper-Content-Form-Input"}>
                <p>Comment</p>
                <textarea
                  placeholder={"Leave a Comment"}
                  maxLength="1000"
                  minLength="3"
                  required
                  onChange={passChangeHandler}
                  value={formState.pass}
                />
              </div>
              <button type={"submit"}>
                <p>Leave a Review</p>
              </button>
            </form>
          </div>
        )}
        {reviewData.length > 0 && (
          <div className={"ProductPage-Content-Cont-CommentsWrapper"}>
            {reviewData.map((el) => (
              <Review data={el} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Review({ data }) {
  let [starData, setStarData] = useState(["", "", "", "", ""]);

  useEffect(() => {
    let half = false;
    if (
      Number(data.rating) > Math.floor(Number(data.rating)) &&
      Number(data.rating) < Math.ceil(Number(data.rating))
    ) {
      half = true;
    }

    let x = starData.map((el, i) => {
      if (i <= Number(data.rating) - 1) {
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
  }, [data]);

  return (
    <div className={"Comment"}>
      <div className={"Comment-Header"}>
        <h2>{data.firstName + " " + data.lastName}</h2>
        <div className={"Comment-Header-Star"}>
          {starData.map((el, i) => {
            return (
              <i
                className={`ph-fill ph-star${el === "half" ? "-half" : ""}`}
                style={el !== "" ? { color: "#ffc300" } : {}}
              ></i>
            );
          })}
          <span>{data.rating} Stars</span>
        </div>
      </div>
      <p className={"Comment-text"}>{data.review}</p>
    </div>
  );
}

export default Reviews;
