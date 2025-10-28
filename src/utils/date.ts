export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

import type { TFunction } from 'vue-i18n';

/**
 * Compute race status from startDate (matches backend logic)
 * - 'past': startDate < today
 * - 'current': startDate is today
 * - 'future': startDate > today
 */
export function getRaceStatus(startDate: string): 'past' | 'current' | 'future' {
    const raceDate = new Date(startDate);
    const today = new Date();

    // Set time to start of day for comparison
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const raceStartOfDay = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());

    if (raceStartOfDay < startOfToday) {
        return 'past';
    } else if (raceDate >= startOfToday && raceDate <= endOfToday) {
        return 'current';
    } else {
        return 'future';
    }
}

/**
 * Check if race is ongoing (happening today)
 */
export function isRaceOngoing(startDate: string): boolean {
    return getRaceStatus(startDate) === 'current';
}

/**
 * Check if race is in the future
 */
export function isRaceFuture(startDate: string): boolean {
    return getRaceStatus(startDate) === 'future';
}

/**
 * Check if race is in the past
 */
export function isRacePast(startDate: string): boolean {
    return getRaceStatus(startDate) === 'past';
}

/**
 * Get localized race status label
 * Note: Frontend uses 'ongoing' but backend uses 'current'
 */
export function getRaceStatusLabel(startDate: string, t: TFunction): string {
    const status = getRaceStatus(startDate);

    switch (status) {
        case 'past':
            return t('race_status.past');
        case 'future':
            return t('race_status.future');
        case 'current':
            return t('race_status.ongoing'); // Map 'current' to 'ongoing' for display
        default:
            return status;
    }
}

/**
 * Check if a race is finished based on all runners' hasFinished status
 * A race is considered finished when ALL results have hasFinished = true
 * @param results - Array of race results from API 2
 * @returns true if all runners have finished, false otherwise
 */
export function isRaceFinished(results: Array<{ hasFinished: boolean }>): boolean {
    if (!results || results.length === 0) {
        return false;
    }

    // A race is finished only if ALL runners have finished
    return results.every(result => result.hasFinished === true);
}
