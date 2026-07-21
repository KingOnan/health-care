import { useEffect, useRef } from "react";

function useBackToClose(isOpen, onClose) {
  const hasPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen && !hasPushedRef.current) {
      window.history.pushState({ modal: true }, "");
      hasPushedRef.current = true;
    }

    if (!isOpen && hasPushedRef.current) {
      hasPushedRef.current = false;
      window.history.back();
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (hasPushedRef.current) {
        hasPushedRef.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
}

export default useBackToClose;
