import useBackToClose from "../hooks/useBackToClose";

function Modal({ open, onClose, manageHistory = true, gap = "gap-6", children }) {
  useBackToClose(manageHistory ? open : false, onClose);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className={`fixed inset-0 z-50 m-auto flex h-fit w-[85%] max-w-sm flex-col ${gap} rounded-2xl bg-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]`}
      >
        {children}
      </div>
    </>
  );
}

export default Modal;
