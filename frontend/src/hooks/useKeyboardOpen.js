import { useEffect, useState } from "react";
import { isTypingElement } from "../utils/keyboard";

// 화면 높이가 이만큼 이상 줄어들면 키패드가 올라온 것으로 봄 (주소창 접힘 같은 작은 변화는 무시)
const KEYBOARD_MIN_HEIGHT = 150;

// 지금 키패드가 실제로 떠 있는지. "입력칸에 커서가 있는지"만 보면, 폰 뒤로가기 등으로 키패드만 닫았을 때
// 커서가 남아 있어 계속 떠 있는 것으로 잘못 판단함 → 화면(visualViewport) 높이가 실제로 줄었는지까지 함께 확인
function useKeyboardOpen() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    // 키패드가 없을 때의 화면 높이(가장 컸던 높이)를 기준으로 삼음
    let fullHeight = viewport.height;

    const update = () => {
      const typing = isTypingElement(document.activeElement);
      if (!typing) fullHeight = Math.max(fullHeight, viewport.height);
      setIsOpen(typing && fullHeight - viewport.height > KEYBOARD_MIN_HEIGHT);
    };

    // 화면 방향이 바뀌면 기준 높이를 새로 잡음
    const handleOrientation = () => {
      fullHeight = 0;
      setTimeout(update, 300);
    };

    viewport.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    window.addEventListener("orientationchange", handleOrientation);
    update();
    return () => {
      viewport.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  return isOpen;
}

export default useKeyboardOpen;
