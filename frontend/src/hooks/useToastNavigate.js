import { useState } from "react";
import { useNavigate } from "react-router-dom";

function useToastNavigate({ message: defaultMessage, to, delay = 1500 }) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  const trigger = (overrideMessage) => {
    setMessage(typeof overrideMessage === "string" ? overrideMessage : defaultMessage);
    setShowToast(true);
    setTimeout(() => {
      if (to) {
        navigate(to);
      } else {
        setShowToast(false);
      }
    }, delay);
  };

  return { showToast, message, trigger };
}

export default useToastNavigate;
