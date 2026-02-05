import { type Notification, NotificationsAPI } from "@/api/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";

export function useNotifications() {
  const { authenticatedFetch, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await NotificationsAPI.fetchAll(authenticatedFetch);
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, user]);

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );

        await NotificationsAPI.markAsRead(id, authenticatedFetch);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la mise à jour de la notification.");
        fetchNotifications();
      }
    },
    [authenticatedFetch, fetchNotifications],
  );

  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        await NotificationsAPI.delete(id, authenticatedFetch);
      } catch (err) {
        console.error(err);
        setError("Impossible de supprimer la notification.");
        fetchNotifications();
      }
    },
    [authenticatedFetch, fetchNotifications],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    deleteNotification,
    unreadCount,
  };
}
