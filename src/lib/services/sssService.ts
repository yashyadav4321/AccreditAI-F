import api from '../api';

export interface SurveyTemplate {
    id: string;
    collegeId: string;
    title: string;
    description?: string;
    academicYear: string;
    isPublished: boolean;
    isActive: boolean;
    shareableSlug: string;
    createdAt: string;
    _count?: { questions: number; responses: number };
    questions?: SurveyQuestion[];
    college?: { name: string; logo?: string };
}

export interface SurveyQuestion {
    id: string;
    templateId: string;
    questionText: string;
    questionType: 'RATING' | 'MULTIPLE_CHOICE' | 'TEXT';
    options: string[];
    isRequired: boolean;
    orderIndex: number;
}

export interface SurveyResults {
    templateId: string;
    templateTitle: string;
    collegeName: string;
    academicYear: string;
    totalResponses: number;
    overallSatisfaction: number;
    questionResults: {
        questionId: string;
        questionText: string;
        questionType: string;
        totalAnswers: number;
        avgRating: number;
        satisfactionPercent: number;
        distribution: Record<number, number>;
    }[];
    departmentBreakdown: {
        department: string;
        responseCount: number;
        avgRating: number;
        satisfactionPercent: number;
    }[];
    responseTrend: { date: string; count: number }[];
}

export const sssService = {
    // Templates
    getTemplates: () => api.get('/sss/templates'),
    createTemplate: (data: { title: string; description?: string; academicYear: string }) =>
        api.post('/sss/templates', data),
    updateTemplate: (id: string, data: Partial<SurveyTemplate>) => api.put(`/sss/templates/${id}`, data),

    // Questions
    getQuestions: (templateId: string) => api.get(`/sss/templates/${templateId}/questions`),
    addQuestion: (templateId: string, data: Partial<SurveyQuestion>) =>
        api.post(`/sss/templates/${templateId}/questions`, data),
    loadDefaults: (templateId: string) =>
        api.post(`/sss/templates/${templateId}/questions/load-defaults`),
    reorderQuestions: (templateId: string, questionIds: string[]) =>
        api.post(`/sss/templates/${templateId}/questions/reorder`, { questionIds }),
    updateQuestion: (id: string, data: Partial<SurveyQuestion>) => api.put(`/sss/questions/${id}`, data),
    deleteQuestion: (id: string) => api.delete(`/sss/questions/${id}`),

    // Public
    getPublicSurvey: (slug: string) => api.get(`/sss/portal/${slug}`),
    submitResponse: (templateId: string, data: {
        studentId: string;
        departmentCode?: string;
        answers: { questionId: string; ratingValue?: number; choiceValue?: string; textValue?: string }[];
    }) => api.post(`/sss/respond/${templateId}`, data),

    // Results
    getResults: (templateId: string) => api.get(`/sss/results/${templateId}`),
};
