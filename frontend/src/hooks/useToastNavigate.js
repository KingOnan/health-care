import { useState } from "react";
import { useNavigate } from "react-router-dom";

function useToastNavigate({ message: defaultMessage, to, delay = 1500 }) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [variant, setVariant] = useState("success");

  const trigger = (overrideMessage, overrideVariant = "success") => {
    setMessage(typeof overrideMessage === "string" ? overrideMessage : defaultMessage);
    setVariant(overrideVariant);
    setShowToast(true);
    setTimeout(() => {
      // 실패했을 땐 성공 시 이동할 곳(to)으로 넘어가지 않고 토스트만 닫음
      if (to && overrideVariant !== "error") {
        navigate(to);
      } else {
        setShowToast(false);
      }
    }, delay);
  };

  return { showToast, message, variant, trigger };
}

export default useToastNavigate;
