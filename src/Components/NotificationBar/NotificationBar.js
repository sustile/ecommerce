import React, { useEffect, useState } from "react";
import "./NotificationBar.css";
import { useSelector, useDispatch } from "react-redux";
import { notificationsAction } from "../../Store/store";
import { motion } from "framer-motion";

export default function NotificationBar() {
  let dispatch = useDispatch();
  let notifications = useSelector((state) => state.notifications);
  let [message, setMessage] = useState("");
  let [type, setType] = useState("");
  let [color, setColor] = useState("");

  useEffect(() => {
    setMessage(notifications.message);
    setType(notifications.type);
    setColor(notifications.color);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      dispatch(notificationsAction.closeNotifications());
    }, 5 * 1000);
  }, []);

  return (
    <motion.div
      className="NotificationBar"
      initial={{
        transform: "translateY(150%) translateX(-50%)",
        transition: {
          type: "spring",
          duration: 0.5,
        },
      }}
      animate={{
        transform: "translateY(0%) translateX(-50%)",
        transition: {
          type: "spring",
          duration: 0.5,
        },
      }}
      exit={{
        transform: "translateY(150%) translateX(-50%)",
        transition: {
          type: "spring",
          duration: 0.5,
        },
      }}
    >
      <div className={`NotificationWrapper ${color !== "normal" ? color : ""}`}>
        {type === "cartAdd" && <i className="ph-bold ph-shopping-cart"></i>}
        {type === "someWrong" && <i className="ph-bold ph-cloud-x"></i>}
        {type === "noUser" && <i className="ph-bold ph-user-circle"></i>}
        {type === "paymentFailed" && <i className="ph-bold ph-bank"></i>}
        {type === "wishAdd" && <i className="ph-bold ph-heart"></i>}
        {type === "comment" && <i className="ph-bold ph-chat-dots"></i>}
        <p className="success">{message}</p>
        <i
          className="ph-bold ph-x closeNotis"
          onClick={() => {
            dispatch(notificationsAction.closeNotifications());
          }}
        ></i>
      </div>
    </motion.div>
  );
}
