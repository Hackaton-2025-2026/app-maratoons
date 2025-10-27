<template>
    <div class="race-card" :class="{ 'race-card--past': race.status === 'past' }" @click="$emit('click', race.id)">
        <div class="race-header">
            <h3>{{ race.name }}</h3>
            <span class="race-status" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div class="race-details">
            <div class="detail">
                <span class="label">Location:</span>
                <span class="value">{{ race.location }}</span>
            </div>
            <div class="detail">
                <span class="label">Date:</span>
                <span class="value">{{ formattedDate }}</span>
            </div>
            <div class="detail">
                <span class="label">Distance:</span>
                <span class="value">{{ race.distance }} km</span>
            </div>
        </div>
        <div v-if="race.status === 'ongoing'" class="live-indicator">
            <span class="pulse"></span>
            Live Now
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Race } from '../types';
import { formatDate, getRaceStatusLabel } from '../utils/date';

const props = defineProps<{
    race: Race;
}>();

defineEmits<{
    (e: 'click', id: string): void;
}>();

const formattedDate = computed(() => formatDate(props.race.startDate));
const statusLabel = computed(() => getRaceStatusLabel(props.race.status));
const statusClass = computed(() => `status-${props.race.status}`);
</script>

<style scoped>
.race-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.race-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Past race styling - grayed out */
.race-card--past {
    background: #f5f5f5;
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
    color: #2c3e50;
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
    color: #7f8c8d;
    min-width: 80px;
}

.value {
    color: #2c3e50;
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
