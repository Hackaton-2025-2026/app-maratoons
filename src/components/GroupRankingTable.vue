<template>
    <div class="group-ranking">
        <h3>{{ $t('group_ranking_table.leaderboard_title') }}</h3>
        <div class="ranking-table">
            <div class="table-header">
                <div class="col-rank">{{ $t('group_ranking_table.rank') }}</div>
                <div class="col-user">{{ $t('group_ranking_table.user') }}</div>
                <div class="col-points">{{ $t('group_ranking_table.points') }}</div>

            </div>
            <div v-for="member in rankings" :key="member.userId" class="table-row"
                :class="{ 'is-current-user': isCurrentUser(member.userId) }">
                <div class="col-rank">
                    <div class="rank-badge" :class="getRankClass(member.position)">
                        {{ member.position }}
                    </div>
                </div>
                <div class="col-user">
                    <Avatar :name="member.userName" :size="32" />
                    <span class="user-name">
                        {{ member.userName }}
                        <span v-if="isCurrentUser(member.userId)" class="you-badge">{{ $t('group_ranking_table.you_badge') }}</span>
                    </span>
                </div>
                <div class="col-points">{{ member.totalPoints }}</div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Avatar from './Avatar.vue';
import { authService } from '../services/auth';
import type { GroupRanking } from '../types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Inline fallback translations
const fallback = {
    leaderboard_title: "Group Leaderboard",
    rank: "Rank",
    user: "User",
    points: "Points",
    you_badge: "You"
};

// Safe translation function with fallback
const $t = (key: string) => {
    try {
        const translated = t('group_ranking_table.' + key);
        if (translated === 'group_ranking_table.' + key || translated.includes('group_ranking_table.')) {
            return fallback[key as keyof typeof fallback] || key;
        }
        return translated;
    } catch {
        return fallback[key as keyof typeof fallback] || key;
    }
};

defineProps<{
    rankings: GroupRanking[];
    currentUserId?: string;
}>();

// Get current user ID
const currentUser = computed(() => authService.getCurrentUser());

const isCurrentUser = (userId: string) => {
    return currentUser.value?.id === userId;
};

const getRankClass = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
};
</script>

<style scoped>
.group-ranking {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px var(--shadow);
}

.group-ranking h3 {
    margin: 0 0 20px 0;
    color: var(--text-primary);
}

.ranking-table {
    display: flex;
    flex-direction: column;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 60px 1fr 100px;
    gap: 16px;
    align-items: center;
    padding: 12px;
}

.table-header {
    font-weight: 600;
    color: var(--text-secondary);
    border-bottom: 2px solid var(--border-color);
    font-size: 0.875rem;
    text-transform: uppercase;
}

.table-row {
    border-bottom: 1px solid var(--border-color);
    transition: background 0.3s ease;
}

.table-row:hover {
    background: var(--bg-primary);
}

.table-row.is-current-user {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    font-weight: 600;
    border: 2px solid #3498db;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.rank-badge {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--border-color);
    color: var(--text-primary);
    font-weight: bold;
}

.rank-badge.gold {
    background: #f1c40f;
    color: white;
}

.rank-badge.silver {
    background: #95a5a6;
    color: white;
}

.rank-badge.bronze {
    background: #cd7f32;
    color: white;
}

.col-user {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-name {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.you-badge {
    display: inline-block;
    padding: 2px 10px;
    background: #3498db;
    color: white;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.col-points,
.col-wins {
    font-weight: 600;
    color: var(--text-primary);
}
</style>
