import api from '@/lib/api';

export interface NbaProgram {
    id: string;
    name: string;
    code: string;
    level: string;
    duration: number;
    departmentId: string;
    departmentName?: string;
    status: string;
    outcomes?: ProgramOutcome[];
    courseOutcomes?: CourseOutcome[];
}

export interface ProgramOutcome {
    id: string;
    programId: string;
    type: 'PO' | 'PSO';
    number: number;
    description: string;
    attainmentLevel?: number;
}

export interface CourseOutcome {
    id: string;
    programId: string;
    courseCode: string;
    courseName: string;
    number: number;
    description: string;
    attainmentLevel?: number;
}

export interface CoPoMapping {
    id: string;
    courseOutcomeId: string;
    programOutcomeId: string;
    correlationLevel: number;
}

const nbaService = {
    getPrograms: () =>
        api.get<NbaProgram[]>('/nba/programs'),

    createProgram: (data: Partial<NbaProgram>) =>
        api.post('/nba/programs', data),

    getProgramById: (id: string) =>
        api.get<NbaProgram>(`/nba/programs/${id}`),

    updateProgram: (id: string, data: Partial<NbaProgram>) =>
        api.put(`/nba/programs/${id}`, data),

    createOutcome: (data: Partial<ProgramOutcome>) =>
        api.post('/nba/outcomes', data),

    updateOutcome: (id: string, data: Partial<ProgramOutcome>) =>
        api.put(`/nba/outcomes/${id}`, data),

    createCourseOutcome: (data: Partial<CourseOutcome>) =>
        api.post('/nba/course-outcomes', data),

    updateCourseOutcome: (id: string, data: Partial<CourseOutcome>) =>
        api.put(`/nba/course-outcomes/${id}`, data),

    createMapping: (data: Partial<CoPoMapping>) =>
        api.post('/nba/mappings', data),

    updateMapping: (id: string, data: Partial<CoPoMapping>) =>
        api.put(`/nba/mappings/${id}`, data),

    deleteMapping: (id: string) =>
        api.delete(`/nba/mappings/${id}`),

    getMappingMatrix: (programId: string) =>
        api.get(`/nba/programs/${programId}/mapping-matrix`),

    saveSarData: (programId: string, data: Record<string, unknown>) =>
        api.post(`/nba/programs/${programId}/sar-data`, data),

    getSarData: (programId: string) =>
        api.get(`/nba/programs/${programId}/sar-data`),

    getAttainment: (programId: string) =>
        api.get(`/nba/programs/${programId}/attainment`),

    getFullAttainment: (programId: string) =>
        api.get(`/nba/programs/${programId}/full-attainment`),

    addAttainmentData: (data: Record<string, unknown>) =>
        api.post('/nba/attainment-data', data),

    updateAttainmentData: (id: string, data: Record<string, unknown>) =>
        api.put(`/nba/attainment-data/${id}`, data),

    deleteAttainmentData: (id: string) =>
        api.delete(`/nba/attainment-data/${id}`),

    getAttainmentConfig: (programId: string) =>
        api.get(`/nba/programs/${programId}/attainment-config`),

    saveAttainmentConfig: (programId: string, data: Record<string, unknown>) =>
        api.put(`/nba/programs/${programId}/attainment-config`, data),
};

export default nbaService;

