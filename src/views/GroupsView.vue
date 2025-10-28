<template>
    <div class="groups-view">
        <div class="header">
            <h1>{{ $t('groups_view.my_groups_title') }}</h1>
        </div>

        <div v-if="loading" class="loading">{{ $t('groups_view.loading_groups') }}</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <template v-else>
            <div v-if="userGroups.length === 0" class="empty-state">
                <p>{{ $t('groups_view.empty_state_message') }}</p>
                <div class="empty-state-actions">
                    <button class="action-button" @click="showCreateModal = true">
                        {{ $t('groups_view.create_group_button') }}
                    </button>
                    <button class="action-button secondary" @click="showJoinModal = true">
                        {{ $t('groups_view.join_group_button') }}
                    </button>
                </div>
            </div>

            <div v-else>
                <div class="groups-grid">
                    <div v-for="group in userGroups" :key="group.id" class="group-card" @click="goToGroup(group.id)">
                        <div class="group-icon">👥</div>
                        <div class="group-info">
                            <h3>{{ group.name }}</h3>
                            <p v-if="group.description" class="description">{{ group.description }}</p>
                            <div class="group-meta">
                                <span>{{ $t('groups_view.members_count', { count: group.memberCount }) }}</span>
                                <span>{{ $t('groups_view.points_count', { count: getGroupPoints(group.id) }) }}</span>
                                <span v-if="isGroupAdmin(group.id)" class="admin-badge">{{ $t('groups_view.admin_badge') }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="actions">
                    <button class="action-button" @click="showCreateModal = true">
                        {{ $t('groups_view.create_group_button') }}
                    </button>
                    <button class="action-button secondary" @click="showJoinModal = true">
                        {{ $t('groups_view.join_group_button') }}
                    </button>
                </div>
            </div>
        </template>

        <div v-if="showJoinModal" class="modal-overlay" @click="showJoinModal = false">
            <div class="modal" @click.stop>
                <h2>{{ $t('groups_view.join_group_modal_title') }}</h2>
                <input v-model="joinCode" type="text" :placeholder="$t('groups_view.enter_group_code_placeholder')" class="input" />
                <div class="modal-actions">
                    <button class="action-button secondary" @click="showJoinModal = false">
                        {{ $t('groups_view.cancel_button') }}
                    </button>
                    <button class="action-button" @click="handleJoinGroup">
                        {{ $t('groups_view.join_button') }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
            <div class="modal" @click.stop>
                <h2>{{ $t('groups_view.create_group_modal_title') }}</h2>
                <input v-model="newGroupName" type="text" :placeholder="$t('groups_view.enter_group_name_placeholder')" class="input" />
                <div class="modal-actions">
                    <button class="action-button secondary" @click="showCreateModal = false">
                        {{ $t('groups_view.cancel_button') }}
                    </button>
                    <button class="action-button" @click="handleCreateGroup">
                        {{ $t('groups_view.create_button') }}
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
import { groupService } from '../services/api';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const loading = ref(false);
const error = ref('');
const showJoinModal = ref(false);
const showCreateModal = ref(false);
const joinCode = ref('');
const newGroupName = ref('');
const userGroups = ref<any[]>([]);
const groupMembers = ref<Record<string, any[]>>({});
const currentUser = computed(() => authService.getCurrentUser());

async function loadUserGroups() {
    loading.value = true;
    error.value = '';

    try {
        if (!currentUser.value) {
            userGroups.value = [];
            loading.value = false;
            return;
        }

        await authService.refreshUserData();
        const allGroups = await groupService.getAllGroups();
        const groupsArray = Array.isArray(allGroups) ? allGroups : [];
        const userGroupsWithMembers = [];
        for (const group of groupsArray) {
            const groupId = group._id || group.id;
            const isOwner = group.owner_id === currentUser.value.id;
            let members: any[] = [];
            try {
                members = await groupService.getGroupMembers(groupId);
                groupMembers.value[groupId] = members;
            } catch (err) {
                console.error(`Error loading members for group ${groupId}:`, err);
                groupMembers.value[groupId] = [];
            }

            // Check if user is a member (in JoinGroup collection)
            const isMember = members.some((member: any) =>
                (member.user_id?._id || member.user_id) === currentUser.value?.id
            );

            // Include group if user is owner OR member
            if (isOwner || isMember) {
                const memberCount = isOwner && !isMember ? members.length + 1 : members.length;
                userGroupsWithMembers.push({
                    ...group,
                    id: groupId,
                    memberCount: memberCount,
                });
            }
        }

        userGroups.value = userGroupsWithMembers;
    } catch (err: any) {
        console.error('Error loading groups:', err);
        error.value = err.message || t('groups_view.error_loading_groups');
    } finally {
        loading.value = false;
    }
}

// Get user's points in a specific group
// Since we don't have the full user data in groupMembers (only JoinGroup records),
// we return the current user's total points (solde) from their profile
function getGroupPoints(_groupId: string): number {
    if (!currentUser.value) return 0;
    return currentUser.value.solde || currentUser.value.points || 0;
}

// Check if user is admin (owner) in a specific group
function isGroupAdmin(groupId: string): boolean {
    if (!currentUser.value) return false;
    const group = userGroups.value.find((g: any) => (g._id || g.id) === groupId);
    if (group && group.owner_id === currentUser.value.id) {
        return true;
    }

    return false;
}

function goToGroup(groupId: string) {
    router.push({ name: 'group', params: { id: groupId } });
}

async function handleJoinGroup() {
    if (!joinCode.value.trim()) {
        alert(t('groups_view.alert_enter_group_code'));
        return;
    }

    try {
        await groupService.joinGroup(joinCode.value);
        showJoinModal.value = false;
        joinCode.value = '';
        alert(t('groups_view.alert_joined_group_success'));
        await loadUserGroups();
    } catch (err: any) {
        console.error('Error joining group:', err);
        alert(t('groups_view.alert_error_joining_group'));
    }
}

async function handleCreateGroup() {
    if (!newGroupName.value.trim()) {
        alert(t('groups_view.alert_enter_group_name'));
        return;
    }
    try {
        await groupService.createGroup(newGroupName.value);
        showCreateModal.value = false;
        newGroupName.value = '';
        alert(t('groups_view.alert_created_group_success'));
        await loadUserGroups();
    } catch (err: any) {
        console.error('Error creating group:', err);
        alert(t('groups_view.alert_error_creating_group'));
    }
}

onMounted(() => {
    loadUserGroups();
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
    gap: 12px;
    padding: 20px 0;
}

.empty-state-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
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
