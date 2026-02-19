import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TransactionForm } from "./TransactionForm";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal = ({ isOpen, onClose }: TransactionModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-brand-green mb-6">Add Transaction</h2>
        <TransactionForm onSuccess={onClose} onCancel={onClose} />
      </div>
    </div>,
    document.body
  );
};
