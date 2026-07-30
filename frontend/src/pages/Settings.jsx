import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, LogOut, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import ConfirmDialog from "../components/ConfirmDialog";
import { getMe } from "../api/user";
import { getToken, clearToken } from "../utils/user";

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMe(token)
      .then(setUser)
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="flex min-h-svh flex-col bg-page-bg">
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <SettingsIcon size={22} />
          </div>
          <h1 className="text-heading font-bold">설정</h1>
        </div>
        {user && (
          <span className="text-lg font-bold text-text">
            <span className="text-primary">{user.user_name}</span> 님
          </span>
        )}
      </header>

      <div className="flex flex-col gap-6 p-6 pt-[100px] pb-26">
        <div className="overflow-hidden rounded-xl border-2 border-primary bg-surface">
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex w-full items-center justify-between py-3 pr-5 pl-4 text-left transition active:bg-page-bg"
          >
            <span className="flex items-center gap-3 text-lg font-bold text-text">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <LogOut size={20} strokeWidth={2.5} />
              </span>
              로그아웃
            </span>
            <ChevronRight size={26} strokeWidth={3} className="text-text-muted" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={
          <span className="flex items-center gap-2">
            <LogOut size={24} strokeWidth={3} className="text-primary" />
            로그아웃 하시겠어요?
          </span>
        }
        confirmLabel="로그아웃"
        cancelLabel="취소"
        tone="primary"
        onConfirm={handleLogout}
        onCancel={() => setConfirmOpen(false)}
      />

      <BottomNav active="settings" />
    </div>
  );
}

export default Settings;
