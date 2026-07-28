import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import Button from "../components/Button";
import SecondaryButton from "../components/SecondaryButton";
import InputField from "../components/InputField";
import Toast from "../components/Toast";
import { login } from "../api/auth";
import { getToken, setToken } from "../utils/auth";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  // 이미 로그인된 상태면 로그인 화면에 다시 들어올 필요가 없으므로 바로 다음 화면으로 이동
  useEffect(() => {
    if (getToken()) {
      navigate("/supplement", { replace: true });
    }
  }, [navigate]);

  // 로그인 성공: 토큰 저장 후 토스트 보여주고 다음 화면으로 이동
  const handleSuccess = (accessToken) => {
    setToken(accessToken, remember);
    setToast({ show: true, message: "로그인했어요", variant: "success" });
    setTimeout(() => navigate("/supplement"), 1000);
  };

  // 로그인 실패: 에러 토스트만 보여주고 화면 이동은 하지 않음
  const handleError = () => {
    setToast({ show: true, message: "아이디 또는 비밀번호가\n올바르지 않아요", variant: "error" });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 1500);
  };

  const handleLogin = async () => {
    try {
      const { accessToken } = await login(userId, password);
      handleSuccess(accessToken);
    } catch {
      handleError();
    }
  };

  const handleDemoLogin = async () => {
    try {
      const { accessToken } = await login("demo", "demo1234");
      handleSuccess(accessToken);
    } catch {
      handleError();
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-page-bg p-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
          <HeartPulse size={32} />
        </div>
        <h1 className="text-display font-bold">건강관리</h1>
      </div>

      <div className="flex w-full flex-col gap-4">
        <InputField
          label="아이디"
          placeholder="아이디 입력"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <InputField
          label="비밀번호"
          placeholder="비밀번호 입력"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="flex items-center gap-2 text-lg font-semibold text-text">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-6 w-6 accent-primary"
          />
          자동 로그인
        </label>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button shadow="" onClick={handleLogin}>
          로그인
        </Button>
        <SecondaryButton onClick={handleDemoLogin}>
          데모 계정으로 둘러보기
        </SecondaryButton>
      </div>

      <Toast show={toast.show} message={toast.message} variant={toast.variant} />
    </div>
  );
}

export default Login;
