<template>
    <div class="groups-view">
        <div class="header">
            <h1>My Groups</h1>
        </div>

        <div v-if="loading" class="loading">Loading groups...</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <template v-else>
            <div v-if="userGroups.length === 0" class="empty-state">
                <p>You haven't joined any groups yet.</p>
                <button class="action-button" @click="showJoinModal = true">
                    Join a Group
                </button>
            </div>

            <div v-else class="groups-grid">
                <div v-for="group in userGroups" :key="group.id" class="group-card" @click="goToGroup(group.id)">
                    <div class="group-icon">👥</div>
                    <div class="group-info">
                        <h3>{{ group.name }}</h3>
                        <p v-if="group.description" class="description">{{ group.description }}</p>
                        <div class="group-meta">
                            <span>{{ group.memberCount }} members</span>
                            <span>{{ getGroupPoints(group.id) }} points</span>
                            <span v-if="isGroupAdmin(group.id)" class="admin-badge">Admin</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions">
                <button class="action-button secondary" @click="showJoinModal = true">
                    Join Another Group
                </button>
            </div>
        </template>

        <div v-if="showJoinModal" class="modal-overlay" @click="showJoinModal = false">
            <div class="modal" @click.stop>
                <h2>Join Group</h2>
                <input v-model="joinCode" type="text" placeholder="Enter group code" class="input" />
                <div class="modal-actions">
                    <button class="action-button secondary" @click="showJoinModal = false">
                        Cancel
                    </button>
                    <button class="action-button" @click="handleJoinGroup">
                        Join
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';
import { mockGroups, mockGroupMembers } from '../services/mockData';
import type { Group, GroupMember } from '../types';

const router = useRouter();

const loading = ref(false);
const error = ref('');
const showJoinModal = ref(false);
const joinCode = ref('');

// Get current user
const currentUser = computed(() => authService.getCurrentUser());

// Get groups the user belongs to
const userGroups = computed(() => {
    const user = currentUser.value;
    if (!user || !user.groups || user.groups.length === 0) {
        return [];
    }
    return mockGroups.filter(group => user.groups?.includes(group.id));
});

// Get user's points in a specific group
function getGroupPoints(groupId: string): number {
    const user = currentUser.value;
    if (!user) return 0;

    const members = mockGroupMembers[groupId] || [];
    const member = members.find(m => m.id === user.id);
    return member?.points || 0;
}

// Check if user is admin in a specific group
function isGroupAdmin(groupId: string): boolean {
    const user = currentUser.value;
    if (!user) return false;

    const members = mockGroupMembers[groupId] || [];
    const member = members.find(m => m.id === user.id);
    return member?.isAdmin || false;
}

function goToGroup(groupId: string) {
    router.push({ name: 'group', params: { id: groupId } });
}

async function handleJoinGroup() {
    if (!joinCode.value.trim()) {
        alert('Please enter a group code');
        return;
    }

    try {
        // In a real app, this would call the API
        // await groupService.joinGroup(joinCode.value);
        showJoinModal.value = false;
        joinCode.value = '';
        alert('Successfully joined the group!');
        // Reload user data to get updated groups list
    } catch (err) {
        console.error('Error joining group:', err);
        alert('Failed to join group. Please check the code and try again.');
    }
}

onMounted(() => {
    loading.value = true;
    // Simulate loading
    setTimeout(() => {
        loading.value = false;
    }, 300);
});
</script>

<style scoped>
.groups-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
}

.header {
    margin-bottom: 32px;
}

.header h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 2rem;
}

.loading,
.error {
    text-align: center;
    padding: 40px;
    font-size: 1.125rem;
}

.loading {
    color: var(--text-secondary);
}

.error {
    color: #e74c3c;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.empty-state p {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin-bottom: 24px;
}

.groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.group-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px var(--shadow);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    gap: 16px;
    align-items: start;
}

.group-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px var(--shadow-heavy);
}

.group-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    border-radius: 12px;
    flex-shrink: 0;
}

.group-info {
    flex: 1;
}

.group-info h3 {
    margin: 0 0 8px 0;
    color: var(--text-primary);
    font-size: 1.25rem;
}

.description {
    margin: 0 0 12px 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.4;
}

.group-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.admin-badge {
    display: inline-block;
    padding: 2px 8px;
    background: #f1c40f;
    color: white;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
}

.actions {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.action-button {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    background: #3498db;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-button:hover {
    background: #2980b9;
    transform: translateY(-2px);
}

.action-button.secondary {
    background: #95a5a6;
}

.action-button.secondary:hover {
    background: #7f8c8d;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
}

.modal h2 {
    margin: 0 0 20px 0;
    color: var(--text-primary);
}

.input {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    font-size: 1rem;
    margin-bottom: 20px;
    transition: border-color 0.3s ease;
    background: var(--bg-primary);
    color: var(--text-primary);
}

.input:focus {
    outline: none;
    border-color: #3498db;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
</style>
