import axios, { AxiosInstance } from 'axios';
import type {
    Race,
    Runner,
    RaceDetails,
    RaceProgress,
    GroupMember,
    Bet,
    UserBetInfo,
    GroupRanking,
    PaginatedResponse
} from '../types';
import { setupMockAdapter } from './mockAdapter';

const API_1_URL = import.meta.env.VITE_API_1_URL;
const API_2_URL = import.meta.env.VITE_API_2_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api1: AxiosInstance = axios.create({
    baseURL: API_1_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const api2: AxiosInstance = axios.create({
    baseURL: API_2_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Initialize mock adapter if enabled
if (USE_MOCK) {
    setupMockAdapter(api1, api2);
}

export const raceService = {
    async getRaces(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Race>> {
        const response = await api1.get('/races', {
            params: { page, pageSize },
        });
        return response.data;
    },

    async getRaceDetails(raceId: string): Promise<RaceDetails> {
        const response = await api2.get(`/race/${raceId}`);
        return response.data;
    },

    async getRaceRunners(raceId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Runner>> {
        const response = await api1.get(`/race/${raceId}/runners`, {
            params: { page, pageSize },
        });
        return response.data;
    },

    async getRaceProgress(raceId: string): Promise<RaceProgress> {
        const response = await api2.get(`/race/${raceId}/km`);
        return response.data;
    },

    async getAllBetsForRace(raceId: string): Promise<UserBetInfo[]> {
        const response = await api1.get(`/race/${raceId}/bets/all`);
        return response.data;
    },
};

export const groupService = {
    async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const response = await api1.get(`/group/${groupId}`);
        return response.data;
    },

    async getGroupBets(groupId: string, raceId: string): Promise<Bet[]> {
        const response = await api1.get(`/group/${groupId}/race/${raceId}`);
        return response.data;
    },

    async getGroupRanking(groupId: string): Promise<GroupRanking[]> {
        const response = await api1.get(`/group/${groupId}/rank`);
        return response.data;
    },

    async joinGroup(groupId: string, code: string): Promise<void> {
        await api1.post(`/group/${groupId}/join`, { code });
    },

    async leaveGroup(groupId: string): Promise<void> {
        await api1.post(`/group/${groupId}/leave`);
    },

    async banMember(groupId: string, userId: string): Promise<void> {
        await api1.post(`/group/${groupId}/ban`, { userId });
    },
};

export const betService = {
    async placeBet(raceId: string, runnerId: string): Promise<void> {
        await api1.post(`/race/${raceId}/bet`, { runnerId });
    },
};
