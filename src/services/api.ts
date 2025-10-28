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
    PaginatedResponse,
    MyBetsResponse
} from '../types';
import { setupMockAdapter } from './mockAdapter';

const API_1_URL = import.meta.env.VITE_API_1_URL;
const API_2_URL = import.meta.env.VITE_API_2_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api1: AxiosInstance = axios.create({
    baseURL: API_1_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    },
    withCredentials: true, // Enable sending cookies with requests
});

const api2: AxiosInstance = axios.create({
    baseURL: API_2_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    },
});

// Initialize mock adapter if enabled
if (USE_MOCK) {
    setupMockAdapter(api1, api2);
}

export const raceService = {
    // Get all races with optional filtering and sorting
    // Backend: GET /api/races?status={status}&sort={sort}
    async getRaces(status?: 'past' | 'current' | 'future', sort?: 'date_asc' | 'date_desc'): Promise<Race[]> {
        const params: Record<string, string> = {};
        if (status) params.status = status;
        if (sort) params.sort = sort;

        const response = await api2.get('/api/races', { params });
        return response.data;
    },

    // Get race details by ID
    // Backend: GET /api/races/{id}
    async getRaceDetails(raceId: string): Promise<RaceDetails> {
        const response = await api2.get(`/api/races/${raceId}`);
        return response.data;
    },

    // Get race results (live rankings)
    // Backend: GET /api/races/{id}/results
    async getRaceResults(raceId: string): Promise<any[]> {
        const response = await api2.get(`/api/races/${raceId}/results`);
        return response.data;
    },

    // Get race progress (current kilometer)
    // Backend: GET /api/races/{id}/km
    async getRaceProgress(raceId: string): Promise<{ kilometer: number }> {
        const response = await api2.get(`/api/races/${raceId}/km`);
        return response.data;
    },

    // Get all bets for a race (from API 1 - betting system)
    async getAllBetsForRace(raceId: string): Promise<UserBetInfo[]> {
        const response = await api1.get(`/race/${raceId}/bets/all`);
        return response.data;
    },

    // Hybrid: Get runners for a race with combined data from API 2 (runner details) and API 1 (betting odds/points)
    async getRaceRunners(raceId: string): Promise<Runner[]> {
        // Get runner details from API 2 (Symfony)
        const runnersResponse = await api2.get(`/api/races/${raceId}/runners`);
        const runnersFromAPI2 = Array.isArray(runnersResponse.data) ? runnersResponse.data : [];

        // Try to get betting data from API 1 (Node.js)
        let bettingData: any[] = [];
        try {
            const betsResponse = await api1.get(`/api/bets/race/${raceId}`);
            bettingData = Array.isArray(betsResponse.data) ? betsResponse.data : [];
        } catch (err) {
            console.warn('Betting odds not available from API 1:', err);
        }

        // Merge data: runner details from API 2 + betting info from API 1
        const hybridRunners = runnersFromAPI2.map((runner: any) => {
            const runnerId = String(runner.id || runner._id).trim();
            console.log('Generated Runner ID in getRaceRunners:', runnerId); // Add this line
            const bettingInfo = bettingData.find((bet: any) =>
                String(bet.runner_id || bet.runnerId).trim() === runnerId
            );

            return {
                id: String(runnerId),
                name: `${runner.firstName || ''} ${runner.lastName || ''}`.trim() || runner.name,
                bibNumber: runner.bibNumber || runner.bib_number || 0,
                points: bettingInfo?.cote || bettingInfo?.points || 0,
                country: runner.nationality || runner.country || '',
                category: runner.category || 'Standard',
                betId: bettingInfo?._id || bettingInfo?.id, // Bets document ID for placing bets
            };
        });

        return hybridRunners;
    },
};

// Runner service for API 2
export const runnerService = {
    // Get all runners
    // Backend: GET /api/runners
    async getAllRunners(): Promise<Runner[]> {
        const response = await api2.get('/api/runners');
        return response.data;
    },

    // Get runner by ID
    // Backend: GET /api/runners/{id}
    async getRunner(runnerId: string): Promise<Runner> {
        const response = await api2.get(`/api/runners/${runnerId}`);
        return response.data;
    },

    // Get runner's results across races
    // Backend: GET /api/runners/{id}/results
    async getRunnerResults(runnerId: string): Promise<any[]> {
        const response = await api2.get(`/api/runners/${runnerId}/results`);
        return response.data;
    },
};

// Result service for API 2
export const resultService = {
    // Get all results
    // Backend: GET /api/results
    async getAllResults(): Promise<any[]> {
        const response = await api2.get('/api/results');
        return response.data;
    },

    // Get result by ID
    // Backend: GET /api/results/{id}
    async getResult(resultId: string): Promise<any> {
        const response = await api2.get(`/api/results/${resultId}`);
        return response.data;
    },
};

export const groupService = {
    async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const response = await api1.get(`/api/groups/${groupId}`);
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

    async getAllGroups(): Promise<any[]> {
        const response = await api1.get('/api/groups');
        return response.data;
    },

    async getGroupById(groupId: string): Promise<any> {
        const response = await api1.get(`/api/groups/details/${groupId}`);
        return response.data;
    },

    async createGroup(name: string): Promise<any> {
        const response = await api1.post('/api/groups/create', { name });
        return response.data;
    },

    async joinGroup(code: string): Promise<void> {
        await api1.post(`/api/groups/join/${code}`);
    },

    async leaveGroup(groupId: string): Promise<void> {
        await api1.post(`/api/groups/${groupId}/leave`);
    },

    async banMember(groupId: string, userToBan: string): Promise<void> {
        await api1.post(`/api/groups/${groupId}/ban`, { userToBan });
    },

    async updateGroup(groupId: string, data: { name: string }): Promise<any> {
        const response = await api1.put(`/api/groups/${groupId}`, data);
        return response.data;
    },

    async deleteGroup(groupId: string): Promise<void> {
        await api1.delete(`/api/groups/${groupId}`);
    },
};

export const betService = {
    async getAllBets(): Promise<any[]> {
        const response = await api1.get('/api/bets');
        return response.data;
    },

    async getBetsByRace(raceId: string): Promise<any[]> {
        const response = await api1.get(`/api/bets/race/${raceId}`);
        return response.data;
    },

    async getBetsByRunner(runnerId: string): Promise<any[]> {
        const response = await api1.get(`/api/bets/runner/${runnerId}`);
        return response.data;
    },

    async getBetById(betId: string): Promise<any> {
        const response = await api1.get(`/api/bets/${betId}`);
        return response.data;
    },

    async createBet(betData: { bet_id: string; solde: number; position_runner?: number }): Promise<any> {
        const response = await api1.post('/api/bets', betData);
        return response.data;
    },

    async updateBet(betId: string, betData: any): Promise<any> {
        const response = await api1.put(`/api/bets/${betId}`, betData);
        return response.data;
    },

    async deleteBet(betId: string): Promise<void> {
        await api1.delete(`/api/bets/${betId}`);
    },
};

// Add user-specific bet endpoints
export const userBetService = {
    async getMyBets(): Promise<MyBetsResponse> {
        const response = await api1.get('/api/users/me/bets');
        return response.data;
    },

    async createMyBet(betData: { bet_id: string; solde: number; position_runner?: number }): Promise<any> {
        const response = await api1.post('/api/users/me/bets', betData);
        return response.data;
    },

    async deleteMyBet(betId: string): Promise<void> {
        await api1.delete(`/api/users/me/bets/${betId}`);
    },
};

// Add user management endpoints
export const userService = {
    async getAllUsers(): Promise<any[]> {
        const response = await api1.get('/api/users');
        return response.data;
    },

    async getUserById(userId: string): Promise<any> {
        const response = await api1.get(`/api/users/${userId}`);
        return response.data;
    },

    async updateUser(userId: string, userData: any): Promise<any> {
        const response = await api1.put(`/api/users/${userId}`, userData);
        return response.data;
    },

    async deleteUser(userId: string): Promise<void> {
        await api1.delete(`/api/users/${userId}`);
    },
};
