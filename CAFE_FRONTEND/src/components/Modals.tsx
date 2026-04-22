/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2f3d2f]/28 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className={cn(
              'relative w-full overflow-hidden rounded-[30px] border border-line bg-card shadow-[0_28px_80px_rgba(37,49,39,0.18)]',
              sizeClasses[size]
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-7 py-5">
              <h3 className="text-[28px] font-semibold tracking-tight text-ink">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="app-icon-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-7">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#f6e3de] text-[#9a5748]">
        <AlertTriangle size={36} strokeWidth={2.1} />
      </div>

      <div>
        <h4 className="text-xl font-semibold text-ink">Delete this record?</h4>
        <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          onClick={onClose}
          className="app-btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-2xl bg-[#a85c4f] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#914c40]"
        >
          Delete Record
        </button>
      </div>
    </div>
  </Modal>
);

export const Toast = ({
  message,
  type = 'success',
  isVisible,
}: {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 40, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 40, x: '-50%' }}
        className={cn(
          'fixed bottom-8 left-1/2 z-[200] flex min-w-[280px] items-center gap-3 rounded-2xl border px-5 py-4 shadow-xl',
          type === 'success'
            ? 'border-[#d8e6d4] bg-card text-[#356245]'
            : 'border-[#eed7d2] bg-card text-[#9a5748]'
        )}
      >
        {type === 'success' ? (
          <CheckCircle2 size={22} />
        ) : (
          <AlertTriangle size={22} />
        )}
        <span className="text-sm font-semibold">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);