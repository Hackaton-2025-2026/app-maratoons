export interface Race {
    id: string;
    name: string;
    location: string;
    startDate: string;
    distance: number;
    status: 'past' | 'future' | 'ongoing';
    description?: string;
}

export interface Runner {
    id: string;
    name: string;
    bibNumber: number;
    points: number;  // Points awarded for betting on this runner
    country?: string;
    category?: string;
}

export interface RaceDetails extends Race {
    totalRunners: number;
    weather?: string;
}

export interface LiveRanking {
    runnerId: string;
    runnerName: string;
    bibNumber: number;
    position: number;
    currentKm: number;
    estimatedTime?: string;
}

export interface RaceProgress {
    raceId: string;
    currentKm: number;
    totalKm: number;
    rankings: LiveRanking[];
    lastUpdate: string;
    winningPoints?: number; // Added this line
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;  // Only used during registration, not stored in state
    role: 'user' | 'admin';
    groups?: string[];  // IDs of groups user belongs to
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    memberCount: number;
}

export interface GroupMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    points: number;  // Points specific to this group
    joinedAt: string;
    isAdmin?: boolean;
    groupId: string;  // Which group this membership is for
}

// Auth related types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Bet {
    userId: string;
    userName: string;
    runnerId: string;
    runnerName: string;
    points: number;  // Points value at time of bet placement
    placedAt: string;
    groupId: string;  // Which group this bet is for
    groupName: string;  // Name of the group
}

export interface UserBetInfo {
    userId: string;
    userName: string;
    runnerId: string;
    runnerName: string;
    points: number;
    placedAt: string;
    groups: Array<{ id: string; name: string; }>;  // All groups this bet applies to
}

export interface GroupRanking {
    userId: string;
    userName: string;
    totalPoints: number;
    wins: number;
    position: number;
    groupId: string;  // Which group this ranking is for
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
