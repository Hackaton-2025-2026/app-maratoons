<template>
    <div class="race-detail-view">
        <div v-if="loading" class="loading">{{ $t('race_detail.loading_details') }}</div>
        <div v-else-if="error" class="error">{{ $t('race_detail.error_loading_details') }}</div>

        <template v-else-if="raceDetails">
            <div class="back-button" @click="goBack">
                {{ $t('race_detail.back_to_races') }}
            </div>

            <div class="race-header">
                <div class="race-info">
                    <h1>{{ raceDetails.name }}</h1>
                    <div class="race-meta">
                        <span class="status" :class="'status-' + raceDetails.status">
                            {{ getRaceStatusLabel(raceDetails.status, t) }}
                        </span>
                        <span>{{ raceDetails.location }}</span>
                        <span>{{ formatDate(raceDetails.startDate) }}</span>
                        <span>{{ raceDetails.distance }} km</span>
                    </div>
                    <p v-if="raceDetails.description" class="description">
                        {{ raceDetails.description }}
                    </p>
                </div>
            </div>

            <div class="content-grid">
                <div class="main-content">
                    <div v-if="raceDetails.status === 'ongoing'" class="section">
                        <LiveRanking v-if="liveData" :rankings="liveData.rankings" :currentKm="liveData.currentKm"
                            :totalKm="liveData.totalKm" :lastUpdate="liveData.lastUpdate"
                            :userBetRunnerId="selectedRunnerId" />
                    </div>

                    <Podium v-if="raceDetails.status === 'past' && liveData && liveData.rankings.length > 0"
                        class="podium-section"
                        :rankings="liveData.rankings"
                        @runnerClick="handleRunnerClick" />

                    <div class="section">
                        <h2>{{ raceDetails.status === 'future' ? $t('race_detail.place_your_bet') : $t('race_detail.runners') }}</h2>
                        <div v-if="loadingRunners" class="loading">{{ $t('race_detail.loading_runners') }}</div>
                        <div v-else class="runners-list">
                            <RunnerCard v-for="runner in runners" :key="runner.id" :runner="runner"
                                :canBet="canPlaceBets" :isSelected="selectedRunnerId === runner.id" @bet="handleBet" />
                        </div>

                        <div v-if="runnersPagination.totalPages > 1" class="pagination">
                            <button :disabled="runnersPagination.page === 1"
                                @click="loadRunnersPage(runnersPagination.page - 1)">
                                {{ $t('race_detail.previous') }}
                            </button>
                            <span>{{ $t('race_detail.page') }} {{ runnersPagination.page }} {{ $t('race_detail.of') }} {{ runnersPagination.totalPages }}</span>
                            <button :disabled="runnersPagination.page === runnersPagination.totalPages"
                                @click="loadRunnersPage(runnersPagination.page + 1)">
                                {{ $t('race_detail.next') }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="sidebar">
                    <div class="section">
                        <h3>{{ $t('race_detail.friends_bets') }}</h3>
                        <div v-if="loadingBets" class="loading-small">{{ $t('race_detail.loading') }}</div>
                        <div v-else-if="bets.length === 0" class="empty-state">
                            {{ $t('race_detail.no_bets_yet') }}
                        </div>
                        <div v-else class="bets-list">
                            <div v-for="bet in bets" :key="bet.userId" class="bet-item"
                                :class="{ 'bet-leader': isRunnerLeading(bet.runnerId), 'bet-winner': isRunnerWinner(bet.runnerId) }">
                                <Avatar :firstName="bet.userName" :size="32" />
                                <div class="bet-info">
                                    <div class="user-name">{{ bet.userName }}</div>
                                    <div class="bet-details">
                                        {{ bet.runnerName }}
                                        <span v-if="bet.groups.length === 1">({{ bet.points }} pts)</span>
                                        <span v-if="isRunnerLeading(bet.runnerId)" class="leader-icon">👑</span>
                                        <span v-if="getBetBadgeInfo(bet)" :class="getBetBadgeInfo(bet)!.class">
                                            {{ getBetBadgeInfo(bet)!.text }}
                                        </span>

                                    </div>
                                    <div class="group-info">
                                        <span v-if="bet.groups.length === 1">{{ $t('race_detail.in_group', { groupName: bet.groups[0].name }) }}</span>
                                        <span v-else>{{ $t('race_detail.in_groups', { count: bet.groups.length }) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LiveRanking from '../components/LiveRanking.vue';
import Podium from '../components/Podium.vue';
import RunnerCard from '../components/RunnerCard.vue';
import Avatar from '../components/Avatar.vue';
import { raceService, betService } from '../services/api';
import { formatDate, getRaceStatusLabel } from '../utils/date';
import type { RaceDetails, Runner, RaceProgress, UserBetInfo } from '../types';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const loading = ref(false);
const loadingRunners = ref(false);
const loadingBets = ref(false);
const error = ref('');

const raceDetails = ref<RaceDetails | null>(null);
const runners = ref<Runner[]>([]);
const liveData = ref<RaceProgress | null>(null);
const bets = ref<UserBetInfo[]>([]);
const selectedRunnerId = ref<string>('');

const runnersPagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
});

let liveUpdateInterval: number | null = null;

const canPlaceBets = computed(() => {
    return raceDetails.value?.status === 'future';
});

// Check if a runner is currently leading the race
function isRunnerLeading(runnerId: string): boolean {
    if (!liveData.value || !liveData.value.rankings || liveData.value.rankings.length === 0) {
        return false;
    }
    return liveData.value.rankings[0].runnerId === runnerId;
}

// Check if a runner is the winner of a past race
function isRunnerWinner(runnerId: string): boolean {
    if (raceDetails.value?.status !== 'past' || !liveData.value || !liveData.value.rankings || liveData.value.rankings.length === 0) {
        return false;
    }
    const winner = liveData.value.rankings.find(r => r.position === 1);
    return winner?.runnerId === runnerId;
}

const getBetBadgeInfo = (bet: UserBetInfo) => {
    const isLive = raceDetails.value?.status === 'ongoing';
    const isPast = raceDetails.value?.status === 'past';
    const isLeader = isRunnerLeading(bet.runnerId);
    const isWinner = isRunnerWinner(bet.runnerId);

    if (isLive) {
        const points = bet.points;
        const colorClass = isLeader ? 'green' : 'red';
        return { text: `${points} pts`, class: `points-badge ${colorClass}` };
    } else if (isPast && isWinner) {
        const points = liveData.value?.winningPoints || 0; // Use winningPoints for past races
        return { text: `+${points} pts`, class: 'points-badge green' };
    }
    return null; // No badge
};

async function loadRaceDetails() {
    loading.value = true;
    error.value = '';

    try {
        const raceId = route.params.id as string;
        raceDetails.value = await raceService.getRaceDetails(raceId);

        // Load runners first, as liveData might depend on it for winning points
        await loadRunners();

        // Load live data for ongoing races (with updates) and past races (for podium)
        if (raceDetails.value.status === 'ongoing' || raceDetails.value.status === 'past') {
            await loadLiveData(); // Now loadLiveData can safely use runners.value
        }

        await loadBets(); // Now loadBets can use liveData.value

        // Only start live updates for ongoing races
        if (raceDetails.value.status === 'ongoing') {
                startLiveUpdates();
            }
    } catch (err) {
        error.value = 'Failed to load race details. Please try again.';
        console.error('Error loading race details:', err);
    } finally {
        loading.value = false;
    }
}

async function loadRunners() {
    loadingRunners.value = true;

    try {
        const raceId = route.params.id as string;
        const response = await raceService.getRaceRunners(
            raceId,
            runnersPagination.value.page,
            runnersPagination.value.pageSize
        );
        runners.value = response.data;
        runnersPagination.value.total = response.total;
        runnersPagination.value.totalPages = response.totalPages;

        // Add mock runners if no real runners are found
        if (runners.value.length === 0) {
            const mockRunners: Runner[] = [
                {
                    id: 'runner-1',
                    name: 'Alice Runner',
                    bibNumber: 101,
                    points: 25,
                    country: 'USA',
                    category: 'Elite',
                },
                {
                    id: 'runner-2',
                    name: 'Bob Sprinter',
                    bibNumber: 102,
                    points: 30,
                    country: 'GBR',
                    category: 'Elite',
                },
                {
                    id: 'runner-3',
                    name: 'Charlie Marathon',
                    bibNumber: 103,
                    points: 20,
                    country: 'KEN',
                    category: 'Amateur',
                },
            ];
            runners.value = mockRunners;
            runnersPagination.value.total = mockRunners.length;
            runnersPagination.value.totalPages = 1;
        }
    } catch (err) {
        console.error('Error loading runners:', err);
    } finally {
        loadingRunners.value = false;
    }
}

async function loadLiveData() {
    try {
        const raceId = route.params.id as string;
        liveData.value = await raceService.getRaceProgress(raceId);

        // Set winning points for past races based on the winner's points
        if (raceDetails.value?.status === 'past' && liveData.value) {
            const winningRunnerId = liveData.value.rankings.find(r => r.position === 1)?.runnerId;
            if (winningRunnerId) {
                // Find the winning runner from the loaded runners list
                const winningRunner = runners.value.find(r => r.id === winningRunnerId);
                if (winningRunner) {
                    liveData.value.winningPoints = winningRunner.points;
                }
            }
        }
    } catch (err) {
        console.error('Error loading live data:', err);
    }
}

async function loadBets() {
    loadingBets.value = true;

    try {
        const raceId = route.params.id as string;
        bets.value = await raceService.getAllBetsForRace(raceId);
        if (raceDetails.value?.status === 'past' && bets.value.length === 0) {
            const winningRunnerId = liveData.value?.rankings.find(r => r.position === 1)?.runnerId;
            const winningRunnerName = liveData.value?.rankings.find(r => r.position === 1)?.runnerName;
        
            const mockBets: UserBetInfo[] = [
                {
                    userId: 'mock-user-1',
                    userName: 'Alice',
                    runnerId: winningRunnerId || 'runner-1',
                    runnerName: winningRunnerName || 'Runner 1',
                    points: 100,
                    placedAt: new Date().toISOString(),
                    groups: [{ id: 'group-a', name: 'Friends' }],
                },
                {
                    userId: 'mock-user-2',
                    userName: 'Bob',
                    runnerId: 'runner-2',
                    runnerName: 'Runner 2',
                    points: 50,
                    placedAt: new Date().toISOString(),
                    groups: [{ id: 'group-a', name: 'Friends' }],
                },
                {
                    userId: 'mock-user-3',
                    userName: 'Charlie',
                    runnerId: winningRunnerId || 'runner-1',
                    runnerName: winningRunnerName || 'Runner 1',
                    points: 120,
                    placedAt: new Date().toISOString(),
                    groups: [{ id: 'group-b', name: 'Family' }],
                },
            ];
            bets.value = mockBets;
        }
    } catch (err) {
        console.error('Error loading bets:', err);
    } finally {
        loadingBets.value = false;
    }
}

function loadRunnersPage(page: number) {
    runnersPagination.value.page = page;
    loadRunners();
}

async function handleBet(runnerId: string) {
    if (!canPlaceBets.value) return;

    try {
        const raceId = route.params.id as string;
        await betService.placeBet(raceId, runnerId);
        selectedRunnerId.value = runnerId;
        await loadBets();
    } catch (err) {
        console.error('Error placing bet:', err);
        alert(t('race_detail.error_placing_bet'));
    }
}

function startLiveUpdates() {
    liveUpdateInterval = window.setInterval(() => {
        loadLiveData();
    }, 10000);
}

function stopLiveUpdates() {
    if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        liveUpdateInterval = null;
    }
}

function goBack() {
    router.push({ name: 'races' });
}

function handleRunnerClick(runnerId: string) {
    // Scroll to runner in the list (optional - for better UX)
    console.log('Clicked runner:', runnerId);
    // You could add functionality here to highlight or scroll to the runner
}

onMounted(() => {
    loadRaceDetails();
});

onUnmounted(() => {
    stopLiveUpdates();
});
</script>

<style scoped>
.race-detail-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
}

.back-button {
    display: inline-flex;
    align-items: center;
    color: #3498db;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
    transition: color 0.3s ease;
}

.back-button:hover {
    color: #2980b9;
}

.loading,
.error {
    text-align: center;
    padding: 40px;
    font-size: 1.125rem;
}

.loading {
    color: #7f8c8d;
}

.error {
    color: #e74c3c;
}

.race-header {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px var(--shadow);
}

.race-header h1 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
    font-size: 2rem;
}

.race-meta {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 16px;
    font-size: 1rem;
    color: var(--text-secondary);
}

.status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.status-past {
    background: #ecf0f1;
    color: #7f8c8d;
}

:root.dark .status-past {
    background: var(--bg-primary);
    color: var(--text-secondary);
}

.status-future {
    background: #e3f2fd;
    color: #1976d2;
}

:root.dark .status-future {
    background: #1a2a3a;
    color: #64b5f6;
}

.status-ongoing {
    background: #e8f5e9;
    color: #388e3c;
}

:root.dark .status-ongoing {
    background: #1a3a1a;
    color: #81c784;
}

.description {
    color: var(--text-primary);
    line-height: 1.6;
    margin: 16px 0 0 0;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

.podium-section {
    margin-bottom: 24px;
}

.section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2,
.section h3 {
    margin: 0 0 20px 0;
    color: #2c3e50;
}

.runners-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.loading-small {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
}

.empty-state {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    font-style: italic;
}

.bets-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.bet-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
}

/* Special styling for bet on current leader or winner */
.bet-item.bet-leader,
.bet-item.bet-winner {
    background: linear-gradient(135deg, #fff9e6 0%, #ffe4b3 50%, #fff9e6 100%);
    background-size: 200% 200%;
    animation: leaderGlow 2s ease-in-out infinite;
    border: 2px solid #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

@keyframes leaderGlow {
    0%, 100% {
        background-position: 0% 50%;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    }
    50% {
        background-position: 100% 50%;
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
    }
}

.bet-item.bet-leader .user-name {
    color: #b8860b;
    font-weight: 700;
}

.bet-item.bet-leader .bet-details {
    color: #8b6914;
    font-weight: 600;
}

.bet-info {
    flex: 1;
}

.user-name {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
}

.bet-details {
    font-size: 0.875rem;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    gap: 6px;
}

.group-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 4px;
    font-style: italic;
}

.leader-icon {
    font-size: 1rem;
    animation: crownBounce 1s ease-in-out infinite;
}

.points-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
    margin-left: 8px;
    color: white; /* Default white text */
}

.points-badge.green {
    background-color: #28a745; /* Green background */
}

.points-badge.red {
    background-color: #dc3545; /* Red background */
}

@keyframes crownBounce {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-3px) rotate(-5deg);
    }
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
    margin-top: 20px;
}

.pagination button {
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    background: #3498db;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
    background: #2980b9;
}

.pagination button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.pagination span {
    color: #7f8c8d;
    font-weight: 600;
}
</style>
