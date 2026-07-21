import { HeartPulse } from "lucide-react";
import Button from "../components/Button";
import SecondaryButton from "../components/SecondaryButton";
import InputField from "../components/InputField";
import Toast from "../components/Toast";
import useToastNavigate from "../hooks/useToastNavigate";

function Login() {
  const { showToast, message, trigger: handleLogin } = useToastNavigate({
    message: "로그인했어요",
    to: "/supplement",
  });

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
          label="이메일"
          placeholder="example@email.com"
          type="email"
        />
        <InputField label="비밀번호" placeholder="비밀번호 입력" type="password" />
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button shadow="" onClick={handleLogin}>
          로그인
        </Button>
        <SecondaryButton onClick={handleLogin}>
          데모 계정으로 둘러보기
        </SecondaryButton>
      </div>

      <Toast show={showToast} message={message} />
    </div>
  );
}

export default Login;
