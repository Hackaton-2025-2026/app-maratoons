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

export function getRaceStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        past: 'Finished',
        future: 'Upcoming',
        ongoing: 'Live',
    };
    return labels[status] || status;
}
