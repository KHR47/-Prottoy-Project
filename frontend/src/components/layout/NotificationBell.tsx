"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { getUser } from "@/lib/auth";
import { toast } from "react-hot-toast";

type Notification = {
  id: number;
  message: string;
  reportId: number;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    const user = getUser();
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Setup socket connection
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api$/, "");
    const socket: Socket = io(baseUrl, { query: { userId: user.id } });

    socket.on("new_notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message, { duration: 6000 });
    });

    // Polling backup every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAsRead(id: number) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  }

  async function markAllAsRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative flex h-7.5 w-7.5 items-center justify-center rounded-lg transition-all"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        }}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] backdrop-blur-xl"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-strong)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div 
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ 
              background: "var(--bg-surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                No notifications yet.
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className="transition-colors"
                    style={{
                      background: !notification.isRead ? "var(--accent-soft)" : "transparent",
                    }}
                  >
                    <div
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                      }}
                      className="block px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3 items-start">
                        {!notification.isRead && (
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-teal-400 flex-shrink-0 animate-pulse" />
                        )}
                        <div className="flex-1">
                          <p 
                            className="text-xs font-medium leading-relaxed"
                            style={{ 
                              color: !notification.isRead ? "var(--text-primary)" : "var(--text-secondary)",
                              fontWeight: !notification.isRead ? "700" : "500"
                            }}
                          >
                            {notification.message}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            {notification.reportId ? (
                              <Link
                                href={`/reports/${notification.reportId}`}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-mono text-teal-400 hover:underline"
                              >
                                View Report →
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
