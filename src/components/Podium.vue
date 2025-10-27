<template>
    <div class="podium-container">
        <h3 class="podium-title">{{ $t('podium.race_winners') }}</h3>
        <div class="podium">
            <!-- Second Place -->
            <div v-if="secondPlace" class="podium-place second" @click="handlePodiumClick(secondPlace)">
                <div class="trophy">🥈</div>
                <div class="runner-info">
                    <div class="bib">{{ secondPlace.bibNumber }}</div>
                    <div class="name">{{ secondPlace.runnerName }}</div>
                </div>
                <div class="podium-rank">2</div>
            </div>

            <!-- First Place -->
            <div v-if="firstPlace" class="podium-place first" @click="handlePodiumClick(firstPlace)">
                <div class="crown">👑</div>
                <div class="trophy">🥇</div>
                <div class="runner-info">
                    <div class="bib">{{ firstPlace.bibNumber }}</div>
                    <div class="name">{{ firstPlace.runnerName }}</div>
                </div>
                <div class="podium-rank champion">1</div>
            </div>

            <!-- Third Place -->
            <div v-if="thirdPlace" class="podium-place third" @click="handlePodiumClick(thirdPlace)">
                <div class="trophy">🥉</div>
                <div class="runner-info">
                    <div class="bib">{{ thirdPlace.bibNumber }}</div>
                    <div class="name">{{ thirdPlace.runnerName }}</div>
                </div>
                <div class="podium-rank">3</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LiveRanking } from '../types';
import { useI18n } from 'vue-i18n';
useI18n();

const props = defineProps<{
    rankings: LiveRanking[];
}>();

const emit = defineEmits<{
    runnerClick: [runnerId: string];
}>();

const firstPlace = computed(() => props.rankings.find(r => r.position === 1));
const secondPlace = computed(() => props.rankings.find(r => r.position === 2));
const thirdPlace = computed(() => props.rankings.find(r => r.position === 3));

function handlePodiumClick(ranking: LiveRanking) {
    emit('runnerClick', ranking.runnerId);
}
</script>

<style scoped>
.podium-container {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px var(--shadow);
}

.podium-title {
    text-align: center;
    color: var(--text-primary);
    font-size: 1.5rem;
    margin: 0 0 32px 0;
}

.podium {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 24px;
    padding: 20px;
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
}

.podium-place {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 20px 24px 20px;
    border-radius: 12px 12px 0 0;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: visible;
    flex: 1;
    user-select: none;
}

.podium-place:hover {
    transform: translateY(-8px);
}

/* First Place - Tallest */
.podium-place.first {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    height: 280px;
    animation: riseUp 1s ease-out 0.2s both, glow 2s ease-in-out infinite;
}

/* Second Place - Medium */
.podium-place.second {
    background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    height: 240px;
    animation: riseUp 1s ease-out 0.4s both;
}

/* Third Place - Shortest */
.podium-place.third {
    background: linear-gradient(135deg, #cd7f32 0%, #e5a05d 100%);
    height: 200px;
    animation: riseUp 1s ease-out 0.6s both;
}

@keyframes riseUp {
    from {
        opacity: 0;
        transform: translateY(100px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }
    50% {
        box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
    }
}

.crown {
    position: absolute;
    top: -30px;
    font-size: 2.5rem;
    animation: bounce 1s ease-in-out infinite, rotate 3s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes rotate {
    0%, 100% {
        transform: rotate(-5deg);
    }
    50% {
        transform: rotate(5deg);
    }
}



.trophy {
    font-size: 3rem;
    margin-bottom: 12px;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.runner-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: auto;
}

.bib {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 28px;
    padding: 0 10px;
    background: white;
    border: 2px solid #333;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.875rem;
    color: #333;
}

.name {
    font-weight: 700;
    font-size: 1rem;
    text-align: center;
    color: #2c3e50;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 100%;
}

.points {
    font-weight: 600;
    font-size: 0.875rem;
    color: #2c3e50;
    opacity: 0.8;
}

.podium-rank {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    font-weight: 700;
    font-size: 1.125rem;
    color: #2c3e50;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.podium-rank.champion {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: 2px solid white;
}

/* Dark mode support */
:root.dark .bib {
    background: var(--bg-primary);
    border-color: var(--border-color);
    color: var(--text-primary);
}

:root.dark .name,
:root.dark .points {
    color: #2c3e50;
    text-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
    .podium {
        gap: 12px;
        padding: 10px;
    }

    .podium-place {
        padding: 20px 12px 0 12px;
    }

    .podium-place.first {
        height: 240px;
    }

    .podium-place.second {
        height: 200px;
    }

    .podium-place.third {
        height: 160px;
    }

    .trophy {
        font-size: 2.5rem;
    }

    .name {
        font-size: 0.85rem;
    }

    .crown {
        font-size: 2rem;
    }
}
</style>
