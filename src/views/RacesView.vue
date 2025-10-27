<template>
    <div class="races-view">
        <div class="header">
            <h1>{{ $t('races_view.marathon_races_title') }}</h1>
            <div class="filters">
                <button v-for="filterKey in filters" :key="filterKey" :class="{ active: activeFilter === filterKey }"
                    @click="activeFilter = filterKey">
                    {{ $t('races_view.filter_' + filterKey) }}
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading">{{ $t('races_view.loading_races') }}</div>
        <div v-else-if="error" class="error">{{ $t('races_view.error_loading_races') }}</div>

        <div v-else class="races-grid">
            <RaceCard v-for="race in filteredRaces" :key="race.id" :race="race" @click="goToRace" />
        </div>

        <div v-if="pagination.totalPages > 1" class="pagination">
                            <button :disabled="pagination.page === 1" @click="loadPage(pagination.page - 1)">
                                {{ $t('races_view.previous_button') }}
                            </button>            <span>{{ $t('races_view.page_text') }} {{ pagination.page }} {{ $t('races_view.of_text') }} {{ pagination.totalPages }}</span>
            <button :disabled="pagination.page === pagination.totalPages" @click="loadPage(pagination.page + 1)">
                {{ $t('races_view.next_button') }}
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
import { useI18n } from 'vue-i18n'; // Import useI18n

const router = useRouter();
const { t } = useI18n(); // Use useI18n
const loading = ref(false);
const error = ref('');
const races = ref<Race[]>([]);
const activeFilter = ref<string>('all');
const filters = ['all', 'live', 'upcoming', 'past'];

const pagination = ref({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
});

const filteredRaces = computed(() => {
    console.log('Active Filter:', activeFilter.value);
    if (activeFilter.value === 'all') return races.value;

    const filterMap: Record<string, string> = {
        'live': 'ongoing',
        'upcoming': 'future',
        'past': 'past',
    };

    return races.value.filter(race => {
        console.log(`Filtering race ${race.name}: status=${race.status}, filterMap[activeFilter.value]=${filterMap[activeFilter.value]}`);
        return race.status === filterMap[activeFilter.value];
    });
});

async function loadRaces() {
    loading.value = true;
    error.value = '';

    try {
        const response = await raceService.getRaces(pagination.value.page, pagination.value.pageSize);
        races.value = response.data;
        pagination.value.total = response.total;
        pagination.value.totalPages = response.totalPages;
        console.log('Loaded races:', races.value);
        console.log('Pagination:', pagination.value);
    } catch (err) {
        error.value = t('races_view.error_loading_races');
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
    color: var(--text-primary);
    font-size: 2rem;
}

.filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.filters button {
    padding: 8px 20px;
    border: 2px solid var(--border-color);
    border-radius: 24px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
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
