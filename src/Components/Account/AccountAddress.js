import React, { useEffect, useReducer, useState } from "react";
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
  address: "",
  addressIsValid: false,
  city: "",
  cityIsValid: false,
  state: "",
  stateIsValid: false,
  pincode: "",
  pincodeIsValid: false,
  firstName: "",
  firstNameIsValid: false,
  lastName: "",
  lastNameIsValid: false,
  formIsValid: false,
};

const formReducer = (state, action) => {
  if (action.type === "ADDRESS_CHANGE") {
    let x = action.data.length >= 6;
    return {
      ...state,
      address: action.data,
      addressIsValid: x,
      formIsValid:
        x &&
        state.lastNameIsValid &&
        state.firstNameIsValid &&
        state.stateIsValid &&
        state.cityIsValid &&
        state.pincodeIsValid,
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
        state.lastNameIsValid &&
        state.addressIsValid &&
        state.stateIsValid &&
        state.cityIsValid &&
        state.pincodeIsValid,
    };
  } else if (action.type === "LAST_NAME_CHANGE") {
    let x =
      action.data.length === 10 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      lastName: action.data,
      lastNameIsValid: x,
      formIsValid:
        x &&
        state.addressIsValid &&
        state.firstNameIsValid &&
        state.stateIsValid &&
        state.cityIsValid &&
        state.pincodeIsValid,
    };
  } else if (action.type === "CITY_CHANGE") {
    let x =
      action.data.length >= 2 &&
      action.data.length <= 30 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      city: action.data,
      cityIsValid: x,
      formIsValid:
        x &&
        state.addressIsValid &&
        state.firstNameIsValid &&
        state.stateIsValid &&
        state.lastNameIsValid &&
        state.pincodeIsValid,
    };
  } else if (action.type === "STATE_CHANGE") {
    let x =
      action.data.length >= 2 &&
      action.data.length <= 30 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      state: action.data,
      stateIsValid: x,
      formIsValid:
        x &&
        state.addressIsValid &&
        state.firstNameIsValid &&
        state.cityIsValid &&
        state.lastNameIsValid &&
        state.pincodeIsValid,
    };
  } else if (action.type === "PINCODE_CHANGE") {
    let x =
      action.data.length >= 2 &&
      action.data.length <= 30 &&
      !action.data.includes("@") &&
      !action.data.includes("#");
    return {
      ...state,
      pincode: action.data,
      pincodeIsValid: x,
      formIsValid:
        x &&
        state.addressIsValid &&
        state.firstNameIsValid &&
        state.cityIsValid &&
        state.lastNameIsValid &&
        state.stateIsValid,
    };
  }
  return intialFormState;
};

function AccountAddress(props) {
  let dispatch = useDispatch();
  let USERDATA = useSelector((state) => state.USERDATA);
  let CONSTANTS = useSelector((state) => state.CONSTANTS);
  let [showForm, setShowForm] = useState(false);

  let [address, setAddress] = useState([]);

  const [formState, dispatchForm] = useReducer(formReducer, intialFormState);

  async function formHandler(e) {
    e.preventDefault();
    let final = {
      name: formState.firstName,
      mobile: formState.lastName,
      address: formState.address,
      city: formState.city,
      pincode: formState.pincode,
      state: formState.state,
    };

    let data = await axios.post(`${CONSTANTS.ip}/api/addAddress`, final);
    if (data.data.status === "ok") {
      // window.location.href = "/shop";
      // dispatch(UserDataActions.loadUserData(data.data.user));
      // dispatch(cartAction.loadCart(data.data.user.cart));
      // dispatch(wishlistAction.loadWish(data.data.user.wishlist));
      dispatch(UserDataActions.loadUserData(data.data.user));
      dispatch(cartAction.loadCart(data.data.user.cart));
      dispatch(wishlistAction.loadWish(data.data.user.wishlist));
      dispatch(addressAction.loadAddress(data.data.user.address));
      dispatchForm({ type: "RESET" });
      dispatch(
        notificationsAction.setNotification({
          type: "noUser",
          color: "green",
          message: "Added new address",
        }),
      );
      setShowForm(false);
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
  function cityChangeHandler(e) {
    dispatchForm({
      type: "CITY_CHANGE",
      data: e.target.value,
    });
  }

  function pincodeChangeHandler(e) {
    dispatchForm({
      type: "PINCODE_CHANGE",
      data: e.target.value,
    });
  }
  function stateChangeHandler(e) {
    dispatchForm({
      type: "STATE_CHANGE",
      data: e.target.value,
    });
  }

  function addressChangeHandler(e) {
    dispatchForm({
      type: "ADDRESS_CHANGE",
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

  useEffect(() => {
    if (USERDATA.email) {
      setAddress(USERDATA.address);
    }
  }, [USERDATA]);

  async function deleteAddressHandler(address) {
    let data = await axios.post(`${CONSTANTS.ip}/api/removeAddress`, address);
    if (data.data.status === "ok") {
      // window.location.href = "/shop";
      dispatch(UserDataActions.loadUserData(data.data.user));
      dispatch(cartAction.loadCart(data.data.user.cart));
      dispatch(wishlistAction.loadWish(data.data.user.wishlist));
      dispatch(addressAction.loadAddress(data.data.user.address));
      dispatch(
        notificationsAction.setNotification({
          type: "noUser",
          color: "green",
          message: "Address Deleted",
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

  return (
    <>
      <div className={"AccountMain-MainHeader"}>
        <div className={"AccountMain-Header"}>
          <h2>Address Book</h2>
          <p>Manage your delivery addresses</p>
        </div>

        {!showForm && (
          // <div className={"AccountMain-MainHeader-AddAddress"}>
          //   <i className="ph-bold ph-plus"></i>
          //   <p
          //     onClick={() => {
          //       setShowForm(true);
          //     }}
          //   >
          //     ADD NEW ADDRESS
          //   </p>
          // </div>
          <div
            className={`Element selectedOption`}
            // onClick={() => setPage(1)}
            onClick={() => {
              setShowForm(true);
            }}
          >
            <i className="ph-bold ph-plus"></i>
            <p>Add Address</p>
          </div>
        )}
      </div>

      <div className={"AccountMain-AddressContainer"}>
        {USERDATA.address.map((el) => {
          return (
            <div className={"AccountMain-Address selectedAddress"}>
              <div className={"AccountMain-Address-Header"}>
                <h2>{el.name}</h2>
                <i
                  className="ph-bold ph-trash"
                  onClick={() => deleteAddressHandler(el)}
                ></i>
              </div>
              <span>+91 {el.mobile}</span>
              <p>{el.address}</p>
              <p>
                {el.city} - {el.pincode}
              </p>
              <p>{el.state}</p>
            </div>
          );
        })}
        {showForm && (
          <div className={"addAddressForm"}>
            <div className={"AccountMain-Header"}>
              <h2 style={{ fontSize: "1.2rem" }}>Add new Address</h2>
            </div>
            <div
              className={"AccountMain-FormContainer"}
              style={{ height: "auto" }}
            >
              <div className={"row"}>
                <div className={"InputContainer"}>
                  <p>Contact NAME</p>
                  <input
                    type={"text"}
                    placeholder={"Contact Name"}
                    maxLength="30"
                    minLength="2"
                    onChange={firstNameChangeHandler}
                    value={formState.firstName}
                  />
                </div>
                <div className={"InputContainer"}>
                  <p>Phone Number</p>
                  <input
                    type={"number"}
                    placeholder={"Phone Number"}
                    maxLength="10"
                    minLength="10"
                    onChange={lastNameChangeHandler}
                    value={formState.lastName}
                  />
                </div>
              </div>
              <div className={"row"}>
                <div className={"InputContainer"}>
                  <p> ADDRESS</p>
                  <textarea
                    type={"email"}
                    required
                    maxLength="100"
                    onChange={addressChangeHandler}
                    value={formState.address}
                  />
                </div>
              </div>
              <div className={"row"}>
                <div className={"InputContainer"}>
                  <p>CITY</p>
                  <input
                    type={"text"}
                    required
                    placeholder={"City"}
                    maxLength="100"
                    onChange={cityChangeHandler}
                    value={formState.city}
                  />
                </div>
                <div className={"InputContainer"}>
                  <p>Pincode</p>
                  <input
                    type={"number"}
                    required
                    placeholder={"Pincode"}
                    maxLength="8"
                    onChange={pincodeChangeHandler}
                    value={formState.pincode}
                  />
                </div>
              </div>
              <div className={"row"}>
                <div className={"InputContainer"}>
                  <p>State</p>
                  <input
                    type={"text"}
                    required
                    placeholder={"State"}
                    maxLength="100"
                    onChange={stateChangeHandler}
                    value={formState.state}
                  />
                </div>
              </div>
            </div>
            <div className={"AccountMain-ButtonContainer"}>
              <div className={"row"}>
                <button
                  onClick={() => {
                    setShowForm(false);
                    dispatchForm({ type: "RESET" });
                  }}
                  className={"cancel"}
                >
                  <p>Cancel</p>
                </button>
                <button
                  onClick={formHandler}
                  className={"confirm"}
                  disabled={!formState.formIsValid}
                >
                  <p>Add Address</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/*<div className={"AccountMain-ButtonContainer"}>*/}
      {/*  <button>*/}
      {/*    <p>Update Address Book</p>*/}
      {/*  </button>*/}
      {/*</div>*/}
    </>
  );
}

export default AccountAddress;
