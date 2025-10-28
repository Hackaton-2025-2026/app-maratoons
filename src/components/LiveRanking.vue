<template>
    <div class="live-ranking">
        <div v-if="currentKm === totalKm" class="confetti-full-screen">
            <div v-confetti="{ particleCount: 200, force: 0.3, duration: 4000 }" class="confetti-origin" />
        </div>
        <div class="header">
            <h3>{{ $t('live_ranking.title') }}</h3>
            <div class="progress-info">
                <span class="km-indicator">{{ currentKm }} / {{ totalKm }} km</span>
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                </div>
                <div class="runner-icon" :style="{ left: progressPercentage + '%' }">
                    <span v-if="currentKm < totalKm">🏃‍♂️</span>
                    <span v-else>🏆</span>
                </div>


            </div>
            <div class="last-update">{{ $t('live_ranking.last_update') }}: {{ formattedLastUpdate }}</div>
        </div>

        <div class="rankings-list">
            <div v-for="ranking in rankings" :key="ranking.runnerId" class="ranking-item"
                :class="{
                    highlighted: isUserBet(ranking.runnerId),
                    'position-up': getPositionChange(ranking.runnerId) === 'up',
                    'position-down': getPositionChange(ranking.runnerId) === 'down',
                    'new-leader': ranking.position === 1 && wasNewLeader(ranking.runnerId)
                }">
                <div class="position">{{ ranking.position }}</div>
                <div class="position-indicator">
                    <span v-if="getPositionChange(ranking.runnerId) === 'up'" class="arrow up">↑</span>
                    <span v-else-if="getPositionChange(ranking.runnerId) === 'down'" class="arrow down">↓</span>
                </div>
                <div class="runner-info">
                    <span class="bib">{{ ranking.bibNumber }}</span>
                    <span class="name">{{ ranking.runnerName }}</span>
                    <span v-if="ranking.position === 1 && wasNewLeader(ranking.runnerId)" class="leader-badge">👑 {{ $t('live_ranking.new_leader') }}</span>
                </div>
                <div class="stats">
                    <span class="km">{{ ranking.currentKm }} km</span>
                    <span v-if="ranking.estimatedTime" class="time">{{ ranking.estimatedTime }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LiveRanking } from '../types';
import { formatTime } from '../utils/date';
import { vConfetti } from '@neoconfetti/vue'; // Import the directive
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Inline fallback translations
const fallback = {
    title: "Live Ranking",
    last_update: "Last Update",
    new_leader: "New Leader"
};

// Safe translation function
const $t = (key: string) => {
    try {
        const translated = t(key);
        if (translated === key || translated.includes('live_ranking.')) {
            const shortKey = key.replace('live_ranking.', '');
            return fallback[shortKey as keyof typeof fallback] || key;
        }
        return translated;
    } catch {
        const shortKey = key.replace('live_ranking.', '');
        return fallback[shortKey as keyof typeof fallback] || key;
    }
};

const props = defineProps<{
    rankings: LiveRanking[];
    currentKm: number;
    totalKm: number;
    lastUpdate: string;
    userBetRunnerId?: string;
}>();

// Track previous positions for animation
const previousPositions = ref<Map<string, number>>(new Map());
const positionChanges = ref<Map<string, 'up' | 'down' | 'same'>>(new Map());
const newLeaderId = ref<string | null>(null);
const previousLeaderId = ref<string | null>(null);


// Watch for rankings changes to detect position changes
watch(() => props.rankings, (newRankings, oldRankings) => {
    if (!oldRankings || oldRankings.length === 0) {
        // Initialize previous positions
        newRankings.forEach(ranking => {
            previousPositions.value.set(ranking.runnerId, ranking.position);
        });
        previousLeaderId.value = newRankings[0]?.runnerId || null;
        return;
    }

    // Detect position changes
    const changes = new Map<string, 'up' | 'down' | 'same'>();
    newRankings.forEach(ranking => {
        const prevPosition = previousPositions.value.get(ranking.runnerId);
        if (prevPosition !== undefined) {
            if (ranking.position < prevPosition) {
                changes.set(ranking.runnerId, 'up');
            } else if (ranking.position > prevPosition) {
                changes.set(ranking.runnerId, 'down');
            } else {
                changes.set(ranking.runnerId, 'same');
            }
        }
        previousPositions.value.set(ranking.runnerId, ranking.position);
    });

    positionChanges.value = changes;

    // Detect new leader
    const currentLeaderId = newRankings[0]?.runnerId;
    if (currentLeaderId && currentLeaderId !== previousLeaderId.value) {
        newLeaderId.value = currentLeaderId;
        // Clear the "new leader" flag after 5 seconds
        setTimeout(() => {
            if (newLeaderId.value === currentLeaderId) {
                newLeaderId.value = null;
            }
        }, 5000);
    }
    previousLeaderId.value = currentLeaderId;

    // Clear position change indicators after 3 seconds
    setTimeout(() => {
        positionChanges.value = new Map();
    }, 3000);
}, { deep: true });

const progressPercentage = computed(() => {
    return Math.min((props.currentKm / props.totalKm) * 100, 100);
});

const formattedLastUpdate = computed(() => formatTime(props.lastUpdate));

const isUserBet = (runnerId: string) => {
    return runnerId === props.userBetRunnerId;
};

const getPositionChange = (runnerId: string): 'up' | 'down' | 'same' => {
    return positionChanges.value.get(runnerId) || 'same';
};

const wasNewLeader = (runnerId: string): boolean => {
    return newLeaderId.value === runnerId;
};
</script>

<style scoped>
.live-ranking {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
    margin-bottom: 24px;
}

.header h3 {
    margin: 0 0 16px 0;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
}

.progress-info {
    margin-bottom: 8px;
    position: relative; /* Added for absolute positioning of runner-icon */
}

.km-indicator {
    color: var(--text-primary);
    font-size: 1.125rem;
}

.progress-bar {
    height: 8px;
    background: #ecf0f1;
    border-radius: 4px;
    margin-top: 8px;
}

.runner-icon {
    position: absolute;
    top: 12px; /* Adjust as needed to position above the bar */
    transform: translateX(-50%) scaleX(-1); /* Center the icon and mirror it */
    font-size: 2rem; /* Adjust size as needed */
    transition: left 1s ease; /* Smooth movement with progress */
    z-index: 1; /* Ensure it's above the progress-fill */
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    transition: width 1s ease;
}

.last-update {
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-top: 8px;
}

.rankings-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.ranking-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.5s ease;
    position: relative;
}

.ranking-item.highlighted {
    background: #e8f5e9;
    border: 2px solid #27ae60;
}

/* Position change animations */
.ranking-item.position-up {
    animation: slideUp 0.6s ease-out;
    background: linear-gradient(90deg, #d5f4e6 0%, #f8f9fa 100%);
}

.ranking-item.position-down {
    animation: slideDown 0.6s ease-out;
    background: linear-gradient(90deg, #fee 0%, #f8f9fa 100%);
}

/* New leader special animation */
.ranking-item.new-leader {
    animation: leaderPulse 1s ease-in-out 3;
    background: linear-gradient(135deg, #fff3cd 0%, #ffd700 50%, #fff3cd 100%);
    background-size: 200% 200%;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

@keyframes slideUp {
    0% {
        transform: translateY(20px);
        opacity: 0.7;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideDown {
    0% {
        transform: translateY(-20px);
        opacity: 0.7;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes leaderPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }
    50% {
        transform: scale(1.03);
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    }
}

.position {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #3498db;
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
}

.ranking-item:nth-child(1) .position {
    background: #f1c40f;
}

.ranking-item:nth-child(2) .position {
    background: #95a5a6;
}

.ranking-item:nth-child(3) .position {
    background: #cd7f32;
}

.runner-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.bib {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 24px;
    padding: 0 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
}

.name {
    font-weight: 600;
    color: var(--text-primary);
}

.stats {
    display: flex;
    gap: 16px;
    font-size: 0.875rem;
}

.km {
    color: #3498db;
    font-weight: 600;
}

.time {
    color: var(--text-secondary);
}

/* Position change indicators */
.position-indicator {
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.arrow {
    font-size: 1.5rem;
    font-weight: bold;
    animation: bounce 0.6s ease-in-out;
}

.arrow.up {
    color: #27ae60;
}

.arrow.down {
    color: #e74c3c;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}

/* Leader badge */
.leader-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: #ffd700;
    color: #000;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: bold;
    margin-left: 8px;
    animation: badgeFadeIn 0.5s ease-in;
}

@keyframes badgeFadeIn {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.confetti-full-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
}

.confetti-origin {
    position: absolute; /* Position absolutely within confetti-full-screen */
    top: 0; /* At the very top */
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Adjust for its own width to truly center */
    width: 1px;
    height: 1px;
}
</style>
