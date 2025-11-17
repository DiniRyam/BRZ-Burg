'use client'

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Fundo escurecido */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Container principal do modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-lg shadow-lg max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          {/* Header do modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="modal-title" className="text-xl font-bold text-gray-900">
              {title}
            </h2>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Fechar modal"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Conteúdo do modal */}
          {children && <div className="p-6">{children}</div>}
        </div>
      </div>
    </>
  );
}
