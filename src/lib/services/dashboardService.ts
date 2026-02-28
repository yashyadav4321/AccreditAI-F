import api from '@/lib/api';

// Matches the backend dashboard.service.ts getCollegeDashboard response
export interface DashboardData {
    college: {
        id: string;
        name: string;
        type: string;
        onboardingCompleted: boolean;
        subscription?: { plan: string; status: string };
        _count: { users: number; departments: number; documents: number };
    };
    compliance: {
        naac: {
            overallScore: number;
            criteria: {
                number: number;
                title: string;
                score: number;
                status: string;
            }[];
        };
        nirf: {
            overallScore: number;
            parameters: {
                number: number;
                title: string;
                score: number;
                maxScore: number;
            }[];
        };
        nba: {
            programCount: number;
            programs: {
                id: string;
                name: string;
                outcomesCount: number;
                isAccredited: boolean;
            }[];
        };
    };
    documents: {
        totalCount: number;
        totalSize: number;
    };
    recentActivity: {
        id: string;
        action: string;
        entity: string;
        user: string;
        createdAt: string;
    }[];
    upcomingDeadlines: {
        id: string;
        title: string;
        dueDate: string;
        framework: string;
        isCompleted: boolean;
    }[];
    pendingTasks: number;
}

const dashboardService = {
    getData: () =>
        api.get<DashboardData>('/dashboard'),
};

export default dashboardService;
