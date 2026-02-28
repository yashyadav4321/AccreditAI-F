import api from '@/lib/api';

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    isPopular?: boolean;
}

export interface Subscription {
    id: string;
    collegeId: string;
    planId: string;
    plan: Plan;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    createdAt: string;
}

const subscriptionService = {
    getPlans: () =>
        api.get<Plan[]>('/subscriptions/plans'),

    getCurrent: () =>
        api.get<Subscription>('/subscriptions/current'),

    createPaymentOrder: (data: { planId: string }) =>
        api.post('/subscriptions/payment-order', data),

    verifyPayment: (data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) =>
        api.post('/subscriptions/verify-payment', data),

    getPayments: () =>
        api.get<Payment[]>('/subscriptions/payments'),

    getHistory: () =>
        api.get<Subscription[]>('/subscriptions/history'),
};

export default subscriptionService;
