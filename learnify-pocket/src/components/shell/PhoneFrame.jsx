import React, { useEffect, useState } from "react";
import "./PhoneFrame.css";

function useClock() {
  const [time, setTime] = useState("09:41");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${mins}`);
    };
    update();
    const timer = setInterval(update, 15000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

/**
 * PhoneFrame
 * Wraps the whole app in the pixel-art "handheld console" bezel + status
 * bar from the design reference, so every screen (auth or dashboard)
 * lives inside the same pocket-console chrome.
 */
export default function PhoneFrame({ children }) {
  const time = useClock();

  return (
    <div className="phone-frame-viewport">
      <div className="phone-frame">
        <div className="phone-frame__status-bar">
          <span className="phone-frame__clock">{time}</span>
          <span className="phone-frame__mode">[8-BIT]</span>
          <div className="phone-frame__battery">
            <span>MAX</span>
            <div className="phone-frame__battery-icon" />
          </div>
        </div>
        <div className="phone-frame__screen">{children}</div>
      </div>
    </div>
  );
}
