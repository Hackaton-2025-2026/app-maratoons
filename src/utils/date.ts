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

export function isRaceOngoing(race: { startDate: string; status: string }): boolean {
    return race.status === 'ongoing';
}

export function isRaceFuture(race: { startDate: string; status: string }): boolean {
    return race.status === 'future';
}

import type { TFunction } from 'vue-i18n'; // Import TFunction type

export function getRaceStatusLabel(status: string, t: TFunction): string {
    switch (status) {
        case 'past':
            return t('race_status.past');
        case 'future':
            return t('race_status.future');
        case 'ongoing':
            return t('race_status.ongoing');
        default:
            return status;
    }
}
