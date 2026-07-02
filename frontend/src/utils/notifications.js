// src/utils/notifications.js
import api from "../api/api";

export const getMyNotifications = async () => {
  const res = await api.get("/notifications/me");
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data?.count ?? 0;
};

export const markNotificationRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};
