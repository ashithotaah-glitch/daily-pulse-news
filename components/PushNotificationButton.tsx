"use client";

import { useState } from "react";

export function PushNotificationButton() {
  const [status, setStatus] = useState("");

  async function enablePush() {
    if (!("Notification" in window)) {
      setStatus("Browser notifications are not supported here.");
      return;
    }
    const permission = await Notification.requestPermission();
    setStatus(permission === "granted" ? "Notifications enabled on this browser." : "Notifications not enabled.");
  }

  return (
    <div className="push-box">
      <button type="button" onClick={enablePush}>Enable browser alerts</button>
      {status ? <small>{status}</small> : <small>Foundation ready. Push delivery service can be connected later.</small>}
    </div>
  );
}
