import React, { useEffect, useReducer } from "react";
import "./Account.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addressAction,
  cartAction,
  notificationsAction,
  UserDataActions,
  wishlistAction,
} from "../../Store/store";

const intialFormState = {
  gst: "",
  email: "",
  emailIsValid: false,
  firstName: "",
  firstNameIsValid: false,
  number: "",
  numberIsValid: false,
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
        state.lastNameIsValid &&
        state.firstNameIsValid &&
        x &&
        state.numberIsValid,
    };
  } else if (action.type === "GST_CHANGE") {
    let x = action.data.length >= 6;
    return {
      ...state,
      gst: action.data,
      formIsValid:
        state.lastNameIsValid &&
        state.firstNameIsValid &&
        state.emailIsValid &&
        state.numberIsValid,
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
        x && state.emailIsValid && state.lastNameIsValid && state.numberIsValid,
    };
  } else if (action.type === "NUMBER_CHANGE") {
    let x =
      action.data.length === 10 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      number: action.data,
      numberIsValid: x,
      formIsValid:
        x &&
        state.emailIsValid &&
        state.lastNameIsValid &&
        state.firstNameIsValid,
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
        state.emailIsValid &&
        state.firstNameIsValid &&
        state.numberIsValid,
    };
  }
  return intialFormState;
};

function AccountDetails(props) {
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);

  const [formState, dispatchForm] = useReducer(formReducer, intialFormState);

  async function formHandler(e) {
    e.preventDefault();
    let final = {};
    final.firstName = formState.firstNameIsValid
      ? formState.firstName
      : USERDATA.firstName;
    final.lastName = formState.lastNameIsValid
      ? formState.lastName
      : USERDATA.lastName;
    final.email = formState.emailIsValid ? formState.email : USERDATA.email;
    final.gst = formState.gst;
    final.phone = formState.numberIsValid ? formState.number : USERDATA.mobile;

    if (
      final.firstName === USERDATA.firstName &&
      final.lastName === USERDATA.lastName &&
      final.email === USERDATA.email &&
      final.gst === USERDATA.gst &&
      final.phone === USERDATA.mobile
    ) {
      //no change to data
      return;
    }

    let data = await axios.post(`${CONSTANTS.ip}/api/changeData`, final);
    if (data.data.status === "ok") {
      // window.location.href = "/shop";
      dispatch(UserDataActions.loadUserData(data.data.user));
      dispatch(cartAction.loadCart(data.data.user.cart));
      dispatch(wishlistAction.loadWish(data.data.user.wishlist));
      dispatch(addressAction.loadAddress(data.data.user.address));
      dispatchForm({ type: "RESET" });
      dispatch(
        notificationsAction.setNotification({
          type: "noUser",
          color: "green",
          message: "Successfully updated user data",
        }),
      );
    } else {
      dispatch(
        notificationsAction.setNotification({
          type: "noUser",
          color: "red",
          message: "Couldn't update user data. Try Again",
        }),
      );
      //somethign went wrong
    }
  }
  function emailChangeHandler(e) {
    dispatchForm({
      type: "EMAIL_CHANGE",
      data: e.target.value,
    });
  }

  function phoneChangeHandler(e) {
    dispatchForm({
      type: "NUMBER_CHANGE",
      data: e.target.value,
    });
  }

  function gstChangeHandler(e) {
    dispatchForm({
      type: "GST_CHANGE",
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
  return (
    <>
      <div className={"AccountMain-Header"} onSubmit={formHandler}>
        <h2>Account Details</h2>
        <p>Manage your suki account</p>
      </div>
      <div className={"AccountMain-FormContainer"}>
        <div className={"row"}>
          <div className={"InputContainer"}>
            <p>FIRST NAME</p>
            <input
              type={"text"}
              placeholder={USERDATA.firstName || "First Name"}
              maxLength="30"
              minLength="2"
              onChange={firstNameChangeHandler}
              value={formState.firstName}
            />
          </div>
          <div className={"InputContainer"}>
            <p>Last NAME</p>
            <input
              type={"text"}
              placeholder={USERDATA.lastName || "Last Name"}
              maxLength="30"
              minLength="2"
              onChange={lastNameChangeHandler}
              value={formState.lastName}
            />
          </div>
        </div>
        <div className={"row"}>
          <div className={"InputContainer"}>
            <p>Phone Number</p>
            <input
              type={"number"}
              placeholder={USERDATA.mobile || "Mobile"}
              required
              maxLength={10}
              onChange={phoneChangeHandler}
              value={formState.number}
            />
          </div>
          <div className={"InputContainer"}>
            <p>EMAIL ADDRESS</p>
            <input
              type={"email"}
              placeholder={USERDATA.email || "Email"}
              required
              maxLength="30"
              onChange={emailChangeHandler}
              value={formState.email}
            />
          </div>
        </div>
        <div className={"row"}>
          <div className={"InputContainer"}>
            <p>GST NUMBER</p>
            <input
              type={"text"}
              placeholder={USERDATA.gst || "Enter your GST Number"}
              minLength="2"
              onChange={gstChangeHandler}
              value={formState.gst}
            />
          </div>
        </div>
      </div>
      <div className={"AccountMain-ButtonContainer"}>
        <button onClick={formHandler}>
          <p>Update Details</p>
        </button>
      </div>
    </>
  );
}

export default AccountDetails;
