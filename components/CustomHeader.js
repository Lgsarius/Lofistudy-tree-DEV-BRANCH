// CustomHeader.jsx
import { signOut } from "next-auth/react";
import styles from "../styles/CustomHeader.module.css";
import { useState, useCallback, useReducer, useEffect } from "react";
import { useRouter } from "next/router";
import MovableModal from "./MovableModal";

// Action types for useReducer
const TOGGLE_FULLSCREEN = "TOGGLE_FULLSCREEN";
const SHOW_TOAST = "SHOW_TOAST";
const HIDE_TOAST = "HIDE_TOAST";
const TOGGLE_DROPDOWN = "TOGGLE_DROPDOWN";

// Reducer to manage the state of the component
const headerReducer = (state, action) => {
  switch (action.type) {
    case TOGGLE_FULLSCREEN:
      return { ...state, isFullscreen: !state.isFullscreen };
    case SHOW_TOAST:
      return { ...state, toast: { show: true, message: action.message } };
    case HIDE_TOAST:
      return { ...state, toast: { show: false, message: "" } };
    case TOGGLE_DROPDOWN:
      return { ...state, dropdownVisible: !state.dropdownVisible };
    default:
      return state;
  }
};

export default function CustomHeader() {
  const router = useRouter();
  const [state, dispatch] = useReducer(headerReducer, {
    isFullscreen: false,
    toast: { show: false, message: "" },
    dropdownVisible: false,
  });

  const toggleFullscreen = useCallback(() => {
    if (!state.isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    dispatch({ type: TOGGLE_FULLSCREEN });
  }, [state.isFullscreen]);

  const shareVideoRoom = useCallback(async () => {
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.url) {
        const fullUrl = `${
          window.location.origin
        }/app?roomUrl=${encodeURIComponent(data.url)}`;
        await navigator.clipboard.writeText(fullUrl);
        dispatch({ type: SHOW_TOAST, message: "Room created! Link copied to clipboard." });
        setTimeout(() => dispatch({ type: HIDE_TOAST }), 3000);
        router.push({
          pathname: "/app",
          query: { roomUrl: data.url },
        });
      } else {
        dispatch({ type: SHOW_TOAST, message: "Error creating room. Please try again." });
      }
    } catch (error) {
      dispatch({ type: SHOW_TOAST, message: "Error creating room. Please try again." });
    }
  }, [router]);

  return (
    <div className={styles.header}>
      <HeaderButton onClick={shareVideoRoom} icon="videocam" tooltip="Share Room" />
      <HeaderButton
        onClick={toggleFullscreen}
        icon={state.isFullscreen ? "fullscreen_exit" : "fullscreen"}
        tooltip={state.isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      />
      <HeaderButton onClick={() => signOut()} icon="logout" tooltip="Logout" />

      {state.toast.show && <Toast message={state.toast.message} />}
    </div>
  );
}

// Reusable Header Button component with tooltip
function HeaderButton({ onClick, icon, tooltip }) {
  return (
    <div className={styles.tooltip}>
      <button className={styles.iconButton} onClick={onClick}>
        <span className="material-icons">{icon}</span>
      </button>
      <span className={styles.tooltiptext}>{tooltip}</span>
    </div>
  );
}

// Toast component
function Toast({ message }) {
  return (
    <div className={styles.toast}>
      <span className={styles.toastMessage}>{message}</span>
    </div>
  );
}
