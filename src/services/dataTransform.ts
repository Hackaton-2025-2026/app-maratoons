// Data transformation layer to map between frontend and backend data models
// Frontend uses "points" concept, backend uses "solde" (balance) and "cote" (odds)

import type { User, Bet, Runner, LiveRanking, BackendResult } from '../types';

/**
 * Transform backend user data to frontend User model
 * Backend uses 'solde' field, frontend uses 'points'
 */
export function transformBackendUser(backendUser: any): User {
    return {
        id: backendUser._id || backendUser.id,
        name: backendUser.name || backendUser.nom || `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),
        email: backendUser.email,
        role: backendUser.role || 'user',
        groups: backendUser.groups || [],
        points: backendUser.solde || 0, // Transform backend 'solde' to frontend 'points'
    };
}

/**
 * Transform backend bet data to frontend Bet model
 * Backend uses 'solde' for bet amount and 'cote' for odds/points
 */
export function transformBackendBet(backendBet: any): Bet {
    return {
        userId: backendBet.user_id?._id || backendBet.user_id,
        userName: backendBet.user_id?.name || 'Unknown User',
        runnerId: backendBet.bet_id?._id || backendBet.bet_id || backendBet.runnerId,
        runnerName: backendBet.bet_id?.runnerName || backendBet.runnerName || 'Unknown Runner',
        points: backendBet.cote || backendBet.bet_id?.cote || 0, // Use 'cote' as points value
        placedAt: backendBet.createdAt || backendBet.placedAt,
        groupId: backendBet.groupId || '',
        groupName: backendBet.groupName || '',
    };
}

/**
 * Transform backend runner/bet data to frontend Runner model
 * Backend uses 'cote' for odds, frontend uses it as 'points'
 */
export function transformBackendRunner(backendRunner: any): Runner {
    return {
        id: backendRunner._id || backendRunner.id,
        name: backendRunner.name || backendRunner.runnerName,
        bibNumber: backendRunner.bibNumber || backendRunner.bib_number || 0,
        points: backendRunner.cote || backendRunner.points || 0, // Use 'cote' as points value
        country: backendRunner.country,
        category: backendRunner.category,
    };
}

/**
 * Transform frontend bet data to backend format
 * Convert points-based bet to solde-based bet
 */
export function transformFrontendBetToBackend(
    betId: string,
    soldeAmount: number,
    positionRunner?: number
): { bet_id: string; solde: number; position_runner?: number } {
    return {
        bet_id: betId,
        solde: soldeAmount, // Amount user wants to bet from their balance
        position_runner: positionRunner,
    };
}

/**
 * Calculate potential winnings based on bet amount and odds
 * gains_potentiels = solde * cote
 */
export function calculatePotentialWinnings(betAmount: number, odds: number): number {
    return betAmount * odds;
}

/**
 * Transform backend user balance (solde) to frontend points display
 */
export function transformSoldeToPoints(solde: number): number {
    return solde; // 1:1 mapping for now, can be adjusted if needed
}

/**
 * Transform frontend points to backend solde for bet placement
 */
export function transformPointsToSolde(points: number): number {
    return points; // 1:1 mapping for now, can be adjusted if needed
}

/**
 * Transform backend group member data to frontend GroupMember model
 */
export function transformBackendGroupMember(backendMember: any, groupId: string): any {
    return {
        id: backendMember._id || backendMember.id,
        firstName: backendMember.firstName || backendMember.name?.split(' ')[0] || '',
        lastName: backendMember.lastName || backendMember.name?.split(' ').slice(1).join(' ') || '',
        email: backendMember.email,
        points: transformSoldeToPoints(backendMember.solde || 0),
        joinedAt: backendMember.joinedAt || backendMember.createdAt,
        isAdmin: backendMember.isAdmin || backendMember.role === 'admin',
        groupId: groupId,
    };
}

/**
 * Transform backend result data to frontend LiveRanking model
 */
export function transformBackendResultToLiveRanking(result: BackendResult, raceCurrentKm: number): LiveRanking {
    return {
        runnerId: String(result.runner.id),
        runnerName: `${result.runner.firstName} ${result.runner.lastName}`.trim(),
        bibNumber: result.runner.bibNumber || result.runner.bib || 0, // Use bibNumber from backend runner object
        position: result.runnerRank,
        currentKm: result.liveKilometer ? parseFloat(result.liveKilometer) : raceCurrentKm, // Use runner's individual km if available, otherwise use race km
        estimatedTime: result.time,
    };
}

/**
 * Batch transform array of backend data to frontend models
 */
export function transformBackendUsers(backendUsers: any[]): User[] {
    return backendUsers.map(transformBackendUser);
}

export function transformBackendBets(backendBets: any[]): Bet[] {
    return backendBets.map(transformBackendBet);
}

export function transformBackendRunners(backendRunners: any[]): Runner[] {
    return backendRunners.map(transformBackendRunner);
}