<template>
    <div class="runner-card" :class="{ selected: isSelected, disabled: !canBet }">
        <div class="runner-info">
            <div class="bib-number">{{ runner.bibNumber }}</div>
            <div class="runner-details">
                <h4>{{ runner.name }}</h4>
                <div class="runner-meta">
                    <span v-if="runner.country">{{ runner.country }}</span>
                    <span v-if="runner.category">{{ runner.category }}</span>
                </div>
            </div>
        </div>
        <div class="points-section">
            <div class="points">{{ runner.points }} pts</div>
            <button v-if="canBet" class="bet-button" :class="{ selected: isSelected }" @click="$emit('bet', runner.id)">
                {{ isSelected ? 'Selected' : 'Bet' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Runner } from '../types';

defineProps<{
    runner: Runner;
    canBet: boolean;
    isSelected?: boolean;
}>();

defineEmits<{
    (e: 'bet', id: string): void;
}>();
</script>

<style scoped>
.runner-card {
    background: white;
    border: 2px solid #ecf0f1;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.runner-card:hover:not(.disabled) {
    border-color: #3498db;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.runner-card.selected {
    border-color: #27ae60;
    background: #f0fff4;
}

.runner-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.runner-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.bib-number {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #3498db;
    color: white;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.125rem;
    flex-shrink: 0;
}

.runner-details h4 {
    margin: 0 0 4px 0;
    color: #2c3e50;
    font-size: 1rem;
}

.runner-meta {
    display: flex;
    gap: 12px;
    font-size: 0.875rem;
    color: #7f8c8d;
}

.points-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.points {
    font-size: 1.25rem;
    font-weight: bold;
    color: #27ae60;
    min-width: 70px;
    text-align: right;
}

.bet-button {
    padding: 8px 24px;
    border: none;
    border-radius: 6px;
    background: #3498db;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.bet-button:hover {
    background: #2980b9;
    transform: translateY(-2px);
}

.bet-button.selected {
    background: #27ae60;
}

.bet-button:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
}
</style>
