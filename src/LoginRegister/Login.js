import React, { useEffect, useReducer, useRef } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
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
    let x =
      action.data.includes("@") &&
      action.data.length >= 10 &&
      action.data[0] !== "@";
    return {
      ...state,
      email: action.data,
      emailIsValid: x,
      formIsValid: state.passIsValid && x,
    };
  } else if (action.type === "PASS_CHANGE") {
    let x = action.data.length >= 6 && action.data.length <= 30;
    return {
      ...state,
      pass: action.data,
      passIsValid: x,
      formIsValid: x && state.emailIsValid,
    };
  }
  return intialFormState;
};

function Login(props) {
  let carousel = ["login1.jpg", "login2.jpg", "login3.jpg"];
  let dispatch = useDispatch();

  let [currSlide, setCurrSlide] = React.useState(0);
  let currSlideRef = useRef();
  useEffect(() => {
    currSlideRef.current = currSlide;
  }, [currSlide]);

  const [formState, dispatchForm] = useReducer(formReducer, intialFormState);
  const CONSTANTS = useSelector((state) => state.CONSTANTS);

  async function formHandler(e) {
    e.preventDefault();
    if (!formState.formIsValid) return;

    let data = await axios.post(`${CONSTANTS.ip}/api/login`, {
      email: formState.email,
      password: formState.pass,
    });

    console.log(data.data);

    if (data.data.status === "ok") {
      dispatch(categoriesAction.setState("Home"));
      window.location.href = "/home";
    } else {
      if (data.data.message === "Invalid Email or Password") {
        dispatch(
          notificationsAction.setNotification({
            type: "noUser",
            color: "red",
            message: "Invalid Email or Password",
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
            <h2>
              Welcome Back<span>!</span>
            </h2>
            <p>
              dON’T HAVE AN ACCOUNT?{" "}
              <span
                onClick={() => {
                  window.location.href = "/register";
                }}
              >
                REGISTER
              </span>
            </p>
          </div>
          <form className={"Login-Wrapper-Content-Form"} onSubmit={formHandler}>
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
            <button type={"submit"}>
              <p>Login</p>
            </button>
            <p className={"link"}>Forgot Password</p>
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

export default Login;
