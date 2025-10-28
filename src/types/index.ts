export interface Race {
    id: string;
    name: string;
    location: string;
    startDate: string; // ISO datetime string
    distance: number;
    description?: string;
    // Note: 'status' is NOT stored - it's computed from startDate
    // Use getRaceStatus(race.startDate) to get computed status
}

export interface Runner {
    id: string;
    name: string;
    bibNumber: number;
    points: number;  // Points awarded for betting on this runner
    country?: string;
    category?: string;
    betId?: string;  // ID of the Bets document from API 1 (needed for placing bets)
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
    points?: number;  // User's points (solde from backend)
    solde?: number;  // Backend field name for points/balance (kept for compatibility)
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
    nom: string;
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

// Backend-specific types (from api-maratoons)
// These represent the actual data structure from the backend API

/**
 * Backend user model - uses 'solde' instead of 'points'
 */
export interface BackendUser {
    _id?: string;
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password?: string;
    solde?: number; // User's balance (backend term)
    role?: string;
    groups?: string[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Backend bet model - uses 'solde' for bet amount and 'cote' for odds
 */
export interface BackendBet {
    _id?: string;
    id?: string;
    user_id: string | BackendUser; // Can be populated
    bet_id: string | any; // Reference to bet type/runner
    solde: number; // Amount wagered from user's balance
    cote?: number; // Odds/multiplier for this bet
    position_runner?: number; // Expected position of runner
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Backend user bet response (from user.controller.js createBet)
 */
export interface BackendUserBetResponse extends BackendBet {
    gains_potentiels?: number; // Potential winnings (solde * cote)
}

/**
 * Backend group model
 */
export interface BackendGroup {
    _id?: string;
    id?: string;
    name: string;
    code?: string; // Invite code
    createdAt?: string;
    updatedAt?: string;
    memberCount?: number;
}

/**
 * Backend runner/bet odds model
 */
export interface BackendRunner {
    _id?: string;
    id?: string;
    name?: string;
    runnerName?: string;
    bibNumber?: number;
    bib_number?: number;
    cote: number; // Odds for this runner (backend uses this as "points" value)
    country?: string;
    category?: string;
}

/**
 * Backend login response - returns ONLY token
 */
export interface BackendLoginResponse {
    token: string;
}

/**
 * Backend registration response - returns user and token
 */
export interface BackendRegisterResponse {
    user: BackendUser;
    token: string;
}

// ==================== API 2 (api-scoring) Types ====================
// These represent the actual data structures from the Symfony backend

/**
 * Backend Race model from API 2 (api-scoring)
 */
export interface BackendRace {
    id: number;
    id_public_race: string; // Public-facing race ID
    name: string;
    description?: string;
    startDate: string; // ISO datetime string
    createAt: string; // ISO datetime string
    updatedAt?: string; // ISO datetime string
    kilometer?: number; // Current kilometer progress
}

/**
 * Backend Runner model from API 2 (api-scoring)
 */
export interface BackendRunnerAPI2 {
    id: number;
    race: {
        id: number;
        name: string;
    };
    firstName: string;
    lastName: string;
    nationality: string;
    bibNumber: number;
    createAt: string; // ISO datetime string
    updatedAt?: string; // ISO datetime string
}

/**
 * Backend Result model from API 2 (api-scoring)
 * Represents a runner's result in a race
 */
export interface BackendResult {
    id: number | string;
    runner: {
        id: string | number;
        firstName: string;
        lastName: string;
        bibNumber?: number; // Bib number from backend (primary field name)
        bib?: number; // Alternative field name for compatibility
    };
    race: {
        id: number;
        name: string;
    };
    time: string; // Time in format HH:MM:SS
    liveKilometer?: string; // Current kilometer for this runner
    runnerRank: number; // Position/rank in the race
    hasFinished: boolean; // Whether runner has finished
    createAt: string; // ISO datetime string
    updatedAt?: string; // ISO datetime string
}

/**
 * Race kilometer progress response from API 2
 */
export interface BackendRaceKilometer {
    kilometer: number;
}

export interface MyBet {
    _id: string;
    user_id: {
        _id: string;
        nom: string;
        email: string;
    };
    bet_id: {
        _id: string;
        race_id: number;
        runner_id: number;
        cote: number;
        position: number;
    };
    solde: number;
    user_groups: {
        _id: string;
        name: string;
        code: string;
    }[];
}

export type MyBetsResponse = MyBet[];
