import React, { useEffect, useReducer, useRef, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { categoriesAction, notificationsAction } from "../Store/store";

const intialFormState = {
  pass: "",
  passIsValid: false,
  mobile: "",
  mobileIsValid: false,
  email: "",
  emailIsValid: false,
  firstName: "",
  firstNameIsValid: false,
  lastName: "",
  lastNameIsValid: false,
  formIsValid: false,
};

const formReducer = (state, action) => {
  if (action.type === "EMAIL_CHANGE") {
    let x =
      action.data.includes("@") &&
      action.data.length >= 10 &&
      action.data[0] !== "@";
    return {
      ...state,
      email: action.data,
      emailIsValid: x,
      formIsValid:
        state.passIsValid &&
        state.lastNameIsValid &&
        state.firstNameIsValid &&
        state.mobileIsValid &&
        x,
    };
  } else if (action.type === "PHONE_CHANGE") {
    let x = action.data.length === 10;
    return {
      ...state,
      mobile: action.data,
      mobileIsValid: x,
      formIsValid:
        x &&
        state.lastNameIsValid &&
        state.firstNameIsValid &&
        state.emailIsValid,
    };
  } else if (action.type === "PASS_CHANGE") {
    let x = action.data.length >= 6 && action.data.length <= 30;
    return {
      ...state,
      pass: action.data,
      passIsValid: x,
      formIsValid:
        x &&
        state.lastNameIsValid &&
        state.firstNameIsValid &&
        state.mobileIsValid &&
        state.emailIsValid,
    };
  } else if (action.type === "FIRST_NAME_CHANGE") {
    let x =
      action.data.length >= 2 &&
      action.data.length <= 30 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      firstName: action.data,
      firstNameIsValid: x,
      formIsValid:
        x &&
        state.passIsValid &&
        state.emailIsValid &&
        state.lastNameIsValid &&
        state.mobileIsValid,
    };
  } else if (action.type === "LAST_NAME_CHANGE") {
    let x =
      action.data.length >= 2 &&
      action.data.length <= 30 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      lastName: action.data,
      lastNameIsValid: x,
      formIsValid:
        x &&
        state.passIsValid &&
        state.mobileIsValid &&
        state.emailIsValid &&
        state.firstNameIsValid,
    };
  }
  return intialFormState;
};

function Register(props) {
  let carousel = ["login1.jpg", "login2.jpg", "login3.jpg"];
  const [formState, dispatchForm] = useReducer(formReducer, intialFormState);
  const CONSTANTS = useSelector((state) => state.CONSTANTS);
  let dispatch = useDispatch();
  let [checkbox, setCheckbox] = useState(false);
  let [currSlide, setCurrSlide] = React.useState(0);
  let currSlideRef = useRef();

  async function formHandler(e) {
    e.preventDefault();

    if (!checkbox) {
      dispatch(
        notificationsAction.setNotification({
          type: "noUser",
          color: "red",
          message: "Please agree to the Terms & Conditions to continue",
        }),
      );
      return;
    }

    if (!formState.formIsValid) return;

    let data = await axios.post(`${CONSTANTS.ip}/api/signup`, {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      password: formState.pass,
      mobile: formState.mobile,
    });

    if (data.data.status === "ok") {
      dispatch(categoriesAction.setState("Home"));
      window.location.href = "/home";
    } else {
      if (data.data.message === "Email already in use") {
        dispatch(
          notificationsAction.setNotification({
            type: "noUser",
            color: "red",
            message: "Email already in use",
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

  function firstNameChangeHandler(e) {
    dispatchForm({
      type: "FIRST_NAME_CHANGE",
      data: e.target.value,
    });
  }

  function lastNameChangeHandler(e) {
    dispatchForm({
      type: "LAST_NAME_CHANGE",
      data: e.target.value,
    });
  }

  function phoneChangeHandler(e) {
    if (e.target.value.length > 10) return;
    dispatchForm({
      type: "PHONE_CHANGE",
      data: e.target.value,
    });
  }

  useEffect(() => {
    currSlideRef.current = currSlide;
  }, [currSlide]);

  useEffect(() => {
    setInterval(() => {
      if (currSlideRef.current === carousel.length - 1) {
        setCurrSlide(0);
      } else {
        setCurrSlide((prev) => {
          return prev + 1;
        });
      }
    }, 3 * 1000);
  }, []);

  return (
    <div className={"Login"}>
      <div className={"Login-Wrapper"}>
        <div className={"Login-Wrapper-Content"}>
          <div className={"Login-Wrapper-Content-Header"}>
            <img src={"./Assets/Images/onlyLogo.svg"} />
            <h2>Become a Member</h2>
            <p>
              Already a Member?{" "}
              <span
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                Login
              </span>
            </p>
          </div>
          <form className={"Login-Wrapper-Content-Form"} onSubmit={formHandler}>
            <div className={"row"}>
              <div className={"Login-Wrapper-Content-Form-Input"}>
                <p>First Name</p>
                <input
                  type={"text"}
                  placeholder={"First Name"}
                  required
                  maxLength="30"
                  minLength="2"
                  onChange={firstNameChangeHandler}
                  value={formState.firstName}
                />
              </div>
              <div className={"Login-Wrapper-Content-Form-Input"}>
                <p>Last Name</p>
                <input
                  type={"text"}
                  placeholder={"Last Name"}
                  required
                  maxLength="30"
                  minLength="2"
                  onChange={lastNameChangeHandler}
                  value={formState.lastName}
                />
              </div>
            </div>
            <div className={"row"}>
              <div className={"Login-Wrapper-Content-Form-Input"}>
                <p>Phone Number</p>
                <input
                  type={"number"}
                  placeholder={"Mobile"}
                  required
                  maxLength={10}
                  onChange={phoneChangeHandler}
                  value={formState.mobile}
                />
              </div>
              <div className={"Login-Wrapper-Content-Form-Input"}>
                <p>Email address</p>
                <input
                  type={"email"}
                  placeholder={"Email"}
                  required
                  maxLength="30"
                  onChange={emailChangeHandler}
                  value={formState.email}
                />
              </div>
            </div>

            <div className={"Login-Wrapper-Content-Form-Input"}>
              <p>Password</p>
              <input
                type={"password"}
                placeholder={"Password"}
                required
                maxLength="30"
                minLength="6"
                onChange={passChangeHandler}
                value={formState.pass}
              />
            </div>
            <div className={"agree-terms"}>
              <div
                className={"checkbox"}
                onClick={() => setCheckbox((prev) => !prev)}
              >
                {checkbox && <i className="ph-bold ph-check"></i>}
              </div>
              <p>
                By filling this form, you confirm that you have read and agree
                to <span>SUKI Ecommerce’s Terms of Service</span> and{" "}
                <span>Privacy Statement</span>
              </p>
            </div>
            <button
              type="submit"
              // disabled={!formState.formIsValid || !checkbox}
            >
              <p>Create Account</p>
            </button>
          </form>
        </div>
        <div className={"Login-Wrapper-Carousel"}>
          {carousel.map((el, i) => (
            <img
              src={`./Assets/Images/${el}`}
              style={{
                transform: `translate(${(i - currSlide) * 100 - 50}% , -50%)`,
              }}
            />
          ))}
          <div className={"carousel-dots-cont"}>
            {carousel.map((el, i) => {
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
                    setCurrSlide(i);
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
