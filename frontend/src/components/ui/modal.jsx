import React from "react";

/**
 * Modal Component
 * 
 * Props:
 * - open (boolean)        : Controls whether the modal is visible.
 * - onClose (function)    : Function to call when the modal or overlay is clicked.
 * - title (string|node)   : Title text or a React node to display in the header.
 * - children (node)       : Main content/body of the modal.
 * - actions (node)        : Optional footer actions (e.g., buttons).
 *
 * Example:
 * <Modal
 *    open={isOpen}
 *    onClose={() => setIsOpen(false)}
 *    title="Add Service"
 *    actions={
 *      <button className="btn-primary" onClick={saveData}>Save</button>
 *    }
 * >
 *    <p>Form goes here...</p>
 * </Modal>
 */
export default function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white text-gray-900 w-full max-w-2xl mx-4 rounded-xl shadow-xl border">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer (Optional) */}
        {actions && (
          <div className="p-4 border-t flex justify-end gap-3 bg-gray-100 rounded-b-xl">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
