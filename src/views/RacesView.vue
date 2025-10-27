<template>
    <div class="races-view">
        <div class="header">
            <h1>Marathon Races</h1>
            <div class="filters">
                <button v-for="filter in filters" :key="filter" :class="{ active: activeFilter === filter }"
                    @click="activeFilter = filter">
                    {{ filter }}
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading">Loading races...</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else class="races-grid">
            <RaceCard v-for="race in filteredRaces" :key="race.id" :race="race" @click="goToRace" />
        </div>

        <div v-if="pagination.totalPages > 1" class="pagination">
            <button :disabled="pagination.page === 1" @click="loadPage(pagination.page - 1)">
                Previous
            </button>
            <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
            <button :disabled="pagination.page === pagination.totalPages" @click="loadPage(pagination.page + 1)">
                Next
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RaceCard from '../components/RaceCard.vue';
import { raceService } from '../services/api';
import type { Race } from '../types';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const races = ref<Race[]>([]);
const activeFilter = ref<string>('All');
const filters = ['All', 'Live', 'Upcoming', 'Past'];

const pagination = ref({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
});

const filteredRaces = computed(() => {
    if (activeFilter.value === 'All') return races.value;

    const filterMap: Record<string, string> = {
        'Live': 'ongoing',
        'Upcoming': 'future',
        'Past': 'past',
    };

    return races.value.filter(race => race.status === filterMap[activeFilter.value]);
});

async function loadRaces() {
    loading.value = true;
    error.value = '';

    try {
        const response = await raceService.getRaces(pagination.value.page, pagination.value.pageSize);
        races.value = response.data;
        pagination.value.total = response.total;
        pagination.value.totalPages = response.totalPages;
    } catch (err) {
        error.value = 'Failed to load races. Please try again.';
        console.error('Error loading races:', err);
    } finally {
        loading.value = false;
    }
}

function loadPage(page: number) {
    pagination.value.page = page;
    loadRaces();
}

function goToRace(raceId: string) {
    router.push({ name: 'race', params: { id: raceId } });
}

onMounted(() => {
    loadRaces();
});
</script>

<style scoped>
.races-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.header {
    margin-bottom: 32px;
}

.header h1 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 2rem;
}

.filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.filters button {
    padding: 8px 20px;
    border: 2px solid #ecf0f1;
    border-radius: 24px;
    background: white;
    color: #7f8c8d;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filters button:hover {
    border-color: #3498db;
    color: #3498db;
}

.filters button.active {
    background: #3498db;
    border-color: #3498db;
    color: white;
}

.loading,
.error {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
    font-size: 1.125rem;
}

.error {
    color: #e74c3c;
}

.races-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
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
