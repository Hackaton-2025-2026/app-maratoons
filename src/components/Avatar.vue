<template>
    <div class="avatar" :style="{ backgroundColor: avatarColor, width: size + 'px', height: size + 'px' }"
        :title="name">
        {{ initial }}
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getInitial, getAvatarColor } from '../utils/avatar';

const props = defineProps<{
    name: string;
    size?: number;
}>();

const size = computed(() => props.size || 40);
const initial = computed(() => getInitial(props.name));
const avatarColor = computed(() => getAvatarColor(props.name));
</script>

<style scoped>
.avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    font-size: calc(var(--size, 40px) / 2);
    user-select: none;
    flex-shrink: 0;
}
</style>
