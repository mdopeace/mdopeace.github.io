"use client";

import { useRef } from "react";
import { FaGithub, FaHeart, FaMugHot, FaXmark } from "react-icons/fa6";

export default function SupportDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    document.body.style.overflow = "hidden";
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const restorePage = () => {
    document.body.style.overflow = "";
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="button-comic support-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-controls="support-dialog"
        onClick={openDialog}
      >
        Support my work{" "}
        <FaHeart aria-hidden="true" focusable="false" className="support-heart" />
      </button>

      <dialog
        ref={dialogRef}
        id="support-dialog"
        className="support-dialog"
        aria-labelledby="support-dialog-title"
        aria-describedby="support-dialog-description"
        onClose={restorePage}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <div className="support-dialog-inner">
          <div className="support-dialog-header">
            <span className="support-dialog-label">SUPPORT THE BUILD</span>
            <button
              className="support-dialog-close"
              type="button"
              onClick={closeDialog}
              aria-label="Close support options"
            >
              <FaXmark aria-hidden="true" focusable="false" />
            </button>
          </div>

          <h3 id="support-dialog-title" className="support-dialog-title">
            Fuel the next build
          </h3>
          <p
            id="support-dialog-description"
            className="support-dialog-description"
          >
            Choose the way that works best for you. Every bit helps keep useful
            ideas moving.
          </p>

          <div className="support-options">
            <a
              className="support-option support-option-github"
              href="https://github.com/sponsors/mdopeace"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub
                className="support-option-icon"
                aria-hidden="true"
                focusable="false"
              />
              <span>
                <strong>GitHub Sponsors</strong>
                <small>Help ship the next small tool</small>
              </span>
              <span className="external-arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <a
              className="support-option support-option-coffee"
              href="https://buymeacoffee.com/mdopeace"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaMugHot
                className="support-option-icon"
                aria-hidden="true"
                focusable="false"
              />
              <span>
                <strong>Buy Me a Coffee</strong>
                <small>Fuel a cup of curiosity</small>
              </span>
              <span className="external-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
