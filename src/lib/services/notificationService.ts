import api from '@/lib/api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

const notificationService = {
    list: (params?: { page?: number; limit?: number }) =>
        api.get('/notifications', { params }),

    getUnreadCount: () =>
        api.get<{ count: number }>('/notifications/unread-count'),

    markAsRead: (id: string) =>
        api.patch(`/notifications/${id}/read`),

    markAllAsRead: () =>
        api.patch('/notifications/read-all'),

    delete: (id: string) =>
        api.delete(`/notifications/${id}`),
};

export default notificationService;
