<template>
    <div class="race-card" :class="{ 'race-card--past': raceStatus === 'past' }" @click="$emit('click', race.id)">
        <div class="race-header">
            <h3>{{ race.name }}</h3>
            <span class="race-status" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div class="race-details">
            <div class="detail">
                <span class="label">{{ $t('race_card.location_label') }}</span>
                <span class="value">{{ race.location }}</span>
            </div>
            <div class="detail">
                <span class="label">{{ $t('race_card.date_label') }}</span>
                <span class="value">{{ formattedDate }}</span>
            </div>
            <div class="detail">
                <span class="label">{{ $t('race_card.distance_label') }}</span>
                <span class="value">{{ race.distance }} {{ $t('race_card.km_suffix') }}</span>
            </div>
        </div>
        <div v-if="raceStatus === 'current'" class="live-indicator">
            <span class="pulse"></span>
            {{ $t('race_card.live_now') }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Race } from '../types';
import { formatDate, getRaceStatusLabel, getRaceStatus } from '../utils/date';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    race: Race;
}>();

const { t } = useI18n();

// Inline fallback translations
const fallback = {
    location_label: "Location:",
    date_label: "Date:",
    distance_label: "Distance:",
    km_suffix: "km",
    live_now: "Live Now"
};

// Safe translation function
const $t = (key: string) => {
    try {
        const translated = t(key);
        if (translated === key || translated.includes('race_card.')) {
            const shortKey = key.replace('race_card.', '');
            return fallback[shortKey as keyof typeof fallback] || key;
        }
        return translated;
    } catch {
        const shortKey = key.replace('race_card.', '');
        return fallback[shortKey as keyof typeof fallback] || key;
    }
};

defineEmits<{
    (e: 'click', id: string): void;
}>();

const formattedDate = computed(() => formatDate(props.race.startDate));
const raceStatus = computed(() => getRaceStatus(props.race.startDate));
const statusLabel = computed(() => getRaceStatusLabel(props.race.startDate, t));
// Map 'current' to 'ongoing' for CSS class
const statusClass = computed(() => `status-${raceStatus.value === 'current' ? 'ongoing' : raceStatus.value}`);
</script>

<style scoped>
.race-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px var(--shadow);
    cursor: pointer;
    transition: all 0.3s ease;
}

.race-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px var(--shadow-heavy);
}

/* Past race styling - grayed out */
.race-card--past {
    background: var(--bg-primary);
    opacity: 0.85;
}

.race-card--past:hover {
    opacity: 1;
    transform: translateY(-2px);
}

.race-card--past .race-header h3 {
    color: #95a5a6;
}

.race-card--past .value {
    color: #95a5a6;
}

.race-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.race-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
}

.race-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.status-past {
    background: #ecf0f1;
    color: #7f8c8d;
}

.status-future {
    background: #e3f2fd;
    color: #1976d2;
}

.status-ongoing {
    background: #e8f5e9;
    color: #388e3c;
}

.race-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail {
    display: flex;
    gap: 8px;
}

.label {
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 80px;
}

.value {
    color: var(--text-primary);
}

.live-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ecf0f1;
    color: #e74c3c;
    font-weight: 600;
}

.pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e74c3c;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1.2);
    }
}
</style>
