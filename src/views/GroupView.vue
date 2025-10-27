<template>
    <div class="group-view">
        <div class="back-button" @click="goBack">
            {{ $t('group_view.back_to_my_groups') }}
        </div>

        <div class="header">
            <h1>{{ groupDetails?.name || $t('group_view.group_fallback_name') }}</h1>
            <button v-if="currentUserIsAdmin" class="edit-group-button" @click="openEditModal" :title="$t('group_view.edit_group_title')">
                {{ $t('group_view.edit_group_button') }}
            </button>
        </div>

        <div v-if="loading" class="loading">{{ $t('group_view.loading_group_data') }}</div>
        <div v-else-if="error" class="error">{{ $t('group_view.error_loading_group_data') }}</div>

        <template v-else>
            <div class="content-grid">
                <div class="main-content">
                    <GroupRankingTable :rankings="rankings" />

                    <div class="section">
                        <h2>{{ $t('group_view.members_title') }}</h2>
                        <div class="members-list">
                            <div v-for="member in members" :key="member.id" class="member-item">
                                <Avatar :firstName="member.firstName" :size="48" />
                                <div class="member-info">
                                    <div class="member-name">
                                        {{ member.firstName }} {{ member.lastName }}
                                        <span v-if="member.isAdmin" class="admin-badge">{{ $t('group_view.admin_badge') }}</span>
                                    </div>
                                    <div class="member-meta">
                                        {{ member.email }}
                                    </div>
                                    <div class="member-meta">
                                        Joined {{ formatDate(member.joinedAt) }}
                                    </div>
                                </div>
                                <div v-if="currentUserIsAdmin && !member.isAdmin && member.id !== currentUser?.id" class="member-actions">
                                    <button class="ban-hammer-button" @click="handleBanMember(member.id)" :title="$t('group_view.ban_user_title')">
                                        🔨
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sidebar">
                    <div class="section">
                        <h3>{{ $t('group_view.group_actions_title') }}</h3>
                        <div class="actions-list">
                            <button class="action-button" @click="handleShareGroup">
                                {{ $t('group_view.share_group_button') }}
                            </button>
                            <button v-if="currentUserIsAdmin" class="action-button danger" @click="handleResetPoints">
                                {{ $t('group_view.reset_points_button') }}
                            </button>
                            <button v-if="currentUserIsAdmin" class="action-button danger" @click="handleDeleteGroup">
                                {{ $t('group_view.delete_group_button') }}
                            </button>
                            <button class="action-button danger" @click="handleLeaveGroup">
                                {{ $t('group_view.leave_group_button') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-if="showJoinModal" class="modal-overlay" @click="showJoinModal = false">
            <div class="modal" @click.stop>
                <h2>{{ $t('group_view.join_group_modal_title') }}</h2>
                <input v-model="joinCode" type="text" :placeholder="$t('group_view.enter_group_code_placeholder')" class="input" />
                <div class="modal-actions">
                    <button class="action-button secondary" @click="showJoinModal = false">
                        {{ $t('group_view.cancel_button') }}
                    </button>
                    <button class="action-button" @click="handleJoinGroup">
                        {{ $t('group_view.join_button') }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
            <div class="modal" @click.stop>
                <h2>{{ $t('group_view.share_group_modal_title') }}</h2>
                <p class="share-description">{{ $t('group_view.share_description', { groupName: groupDetails?.name }) }}</p>
                <div class="share-code-container">
                    <input v-model="shareCode" type="text" readonly class="share-code-input" />
                    <button class="copy-button" @click="copyShareCode">
                        {{ copied ? $t('group_view.copied_button') : $t('group_view.copy_button') }}
                    </button>
                </div>
                <div class="modal-actions">
                    <button class="action-button" @click="showShareModal = false">
                        {{ $t('group_view.close_button') }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
            <div class="modal" @click.stop>
                <h2>{{ $t('group_view.edit_group_modal_title') }}</h2>
                <div class="form-group">
                    <label for="group-name">{{ $t('group_view.group_name_label') }}</label>
                    <input id="group-name" v-model="editGroupName" type="text" class="input" :placeholder="$t('group_view.enter_group_name_placeholder')" />
                </div>
                <div class="modal-actions">
                    <button class="action-button secondary" @click="showEditModal = false">
                        Cancel
                    </button>
                    <button class="action-button" @click="handleSaveGroupEdit">
                        {{ $t('group_view.save_changes_button') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from '../components/Avatar.vue';
import GroupRankingTable from '../components/GroupRankingTable.vue';
import { groupService } from '../services/api';
import { authService } from '../services/auth';
import { formatDate } from '../utils/date';
import { mockGroups } from '../services/mockData';
import type { GroupMember, GroupRanking } from '../types';
import { useI18n } from 'vue-i18n'; // Import useI18n

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const loading = ref(false);
const error = ref('');
const members = ref<GroupMember[]>([]);
const rankings = ref<GroupRanking[]>([]);
const showJoinModal = ref(false);
const joinCode = ref('');
const showShareModal = ref(false);
const shareCode = ref('');
const copied = ref(false);
const showEditModal = ref(false);
const editGroupName = ref('');

// Get current user
const currentUser = computed(() => authService.getCurrentUser());

// Get group ID from route parameter
const groupId = computed(() => {
    return route.params.id as string;
});

// Get group details
const groupDetails = computed(() => {
    return mockGroups.find(g => g.id === groupId.value);
});

// Check if current user is admin in THIS specific group
const currentUserIsAdmin = computed(() => {
    const user = currentUser.value;
    if (!user) return false;

    // Check if user is admin in this specific group by looking at the members list
    const member = members.value.find(m => m.id === user.id);
    return member?.isAdmin || false;
});

async function loadGroupData() {
    loading.value = true;
    error.value = '';

    try {
        const currentGroupId = groupId.value;
        const [membersData, rankingsData] = await Promise.all([
            groupService.getGroupMembers(currentGroupId),
            groupService.getGroupRanking(currentGroupId),
        ]);

        members.value = membersData;
        rankings.value = rankingsData;
    } catch (err) {
        error.value = 'Failed to load group data. Please try again.';
        console.error('Error loading group data:', err);
    } finally {
        loading.value = false;
    }
}

async function handleJoinGroup() {
    if (!joinCode.value.trim()) {
        alert(t('group_view.alert_enter_group_code'));
        return;
    }

    try {
        await groupService.joinGroup(groupId.value, joinCode.value);
        showJoinModal.value = false;
        joinCode.value = '';
        await loadGroupData();
    } catch (err) {
        console.error('Error joining group:', err);
        alert(t('group_view.alert_error_joining_group'));
    }
}

function handleShareGroup() {
    shareCode.value = `${groupId.value.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    showShareModal.value = true;
    copied.value = false;
}

function openEditModal() {
    editGroupName.value = groupDetails.value?.name || '';
    showEditModal.value = true;
}

async function handleSaveGroupEdit() {
    if (!editGroupName.value.trim()) {
        alert(t('group_view.alert_enter_group_name'));
        return;
    }

    try {
        // In a real app, this would call the API
        // await groupService.updateGroup(groupId.value, { name: editGroupName.value });

        // Update the local group details (in real app, this would be reloaded from API)
        if (groupDetails.value) {
            groupDetails.value.name = editGroupName.value;
        }

        showEditModal.value = false;
        alert(t('group_view.alert_group_updated_success'));
    } catch (err) {
        console.error('Error updating group:', err);
        alert(t('group_view.alert_error_updating_group'));
    }
}

async function copyShareCode() {
    try {
        await navigator.clipboard.writeText(shareCode.value);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Error copying to clipboard:', err);
        // Fallback for browsers that don't support clipboard API
        alert(`Share code: ${shareCode.value}`);
    }
}

async function handleDeleteGroup() {
    if (!confirm(t('group_view.delete_confirm_1'))) {
        return;
    }

    // Double confirmation for destructive action
    if (!confirm(t('group_view.delete_confirm_2'))) {
        return;
    }

    try {
        // In a real app, this would call the API
        // await groupService.deleteGroup(groupId.value);
        alert(t('group_view.group_deleted_success'));
        router.push({ name: 'groups' });
    } catch (err) {
        console.error('Error deleting group:', err);
        alert(t('group_view.error_deleting_group'));
    }
}

async function handleResetPoints() {
    if (!confirm(t('group_view.reset_points_confirm_1'))) {
        return;
    }

    // Double confirmation for destructive action
    if (!confirm(t('group_view.reset_points_confirm_2'))) {
        return;
    }

    try {
        // In a real app, this would call the API
        // await groupService.resetGroupPoints(groupId.value);
        alert(t('group_view.points_reset_success'));
        await loadGroupData(); // Reload data to reflect changes
    } catch (err) {
        console.error('Error resetting points:', err);
        alert(t('group_view.error_resetting_points'));
    }
}

async function handleLeaveGroup() {
    if (!confirm(t('group_view.leave_confirm'))) {
        return;
    }

    try {
        await groupService.leaveGroup(groupId.value);
        router.push({ name: 'groups' });
    } catch (err) {
        console.error('Error leaving group:', err);
        alert(t('group_view.error_leaving_group'));
    }
}

async function handleBanMember(userId: string) {
    if (!confirm(t('group_view.ban_member_confirm'))) {
        return;
    }

    try {
        await groupService.banMember(groupId.value, userId);
        await loadGroupData();
    } catch (err) {
        console.error('Error banning member:', err);
        alert(t('group_view.error_banning_member'));
    }
}

function goBack() {
    router.push({ name: 'groups' });
}

onMounted(() => {
    loadGroupData();
});
</script>

<style scoped>
.group-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
}

.back-button {
    display: inline-flex;
    align-items: center;
    color: #3498db;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
    transition: color 0.3s ease;
}

.back-button:hover {
    color: #2980b9;
}

.header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
}

.header h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 2rem;
}

.edit-group-button {
    padding: 8px 16px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
}

.edit-group-button:hover {
    border-color: #3498db;
    color: #3498db;
    transform: translateY(-2px);
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

.action-button.danger {
    background: #e74c3c;
}

.action-button.danger:hover {
    background: #c0392b;
}

.danger-button {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    background: #e74c3c;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.danger-button:hover {
    background: #c0392b;
}

.ban-hammer-button {
    padding: 8px 12px;
    border: 2px solid #e74c3c;
    border-radius: 8px;
    background: transparent;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ban-hammer-button:hover {
    background: #e74c3c;
    transform: rotate(-15deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.ban-hammer-button:active {
    transform: rotate(-15deg) scale(1.2);
}

.member-actions {
    display: flex;
    align-items: center;
}

.loading,
.error {
    text-align: center;
    padding: 40px;
    font-size: 1.125rem;
}

.loading {
    color: #7f8c8d;
}

.error {
    color: #e74c3c;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

.section {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px var(--shadow);
}

.section h2,
.section h3 {
    margin: 0 0 20px 0;
    color: var(--text-primary);
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 8px;
}

.member-info {
    flex: 1;
}

.member-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
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

.member-meta {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 2px;
}

.actions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.actions-list button {
    width: 100%;
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

.share-description {
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.5;
}

.share-code-container {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.share-code-input {
    flex: 1;
    padding: 12px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    font-size: 1.125rem;
    font-weight: 600;
    text-align: center;
    background: var(--bg-primary);
    color: var(--text-primary);
    letter-spacing: 1px;
}

.copy-button {
    padding: 12px 20px;
    border: none;
    border-radius: 6px;
    background: #27ae60;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.copy-button:hover {
    background: #229954;
    transform: translateY(-2px);
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

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.875rem;
}
</style>
