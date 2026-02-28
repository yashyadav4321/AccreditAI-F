import api from '@/lib/api';

const departmentService = {
    list: () =>
        api.get('/departments'),

    create: (data: { name: string; code: string }) =>
        api.post('/departments', data),

    update: (id: string, data: { name?: string; code?: string }) =>
        api.put(`/departments/${id}`, data),

    delete: (id: string) =>
        api.delete(`/departments/${id}`),
};

export default departmentService;
