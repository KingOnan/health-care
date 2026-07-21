import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useBackToClose from "../hooks/useBackToClose";

function AddMenuButton({ options, themeClass }) {
  const [isOpen, setIsOpen] = useState(false);
  useBackToClose(isOpen, () => setIsOpen(false));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 ${
          isOpen ? "rotate-45" : ""
        }`}
        style={{
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3), inset 0 -3px 5px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Plus size={26} strokeWidth={2.5} className="relative z-10" />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[9998] bg-black/50"
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`fixed top-20 right-6 z-[9999] flex flex-col items-end gap-3 ${themeClass}`}
              >
                {options.map(({ icon: Icon, label, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="flex items-center gap-2 rounded-full border-[5px] border-primary bg-surface px-5 py-3 shadow-[0_0_11px_rgba(0,0,0,0.2)]"
                  >
                    <Icon size={20} strokeWidth={3} className="text-primary" />
                    <span className="text-lg font-semibold whitespace-nowrap text-text">
                      {label}
                    </span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export default AddMenuButton;
