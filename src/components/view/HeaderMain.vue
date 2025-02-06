<script lang="ts" setup>
import { RouterLink } from "vue-router";
import Icon from "../base/Icon.vue";
import FinanceIcon from "@/Icons/finance.svg";
import { useUser } from "@/stores/user";

export interface Props {
    title: string;
}
defineProps<Props>();

const user = useUser();
</script>
<template>
    <div class="header-main">
        <div class="flex items-center">
            <h1 class="fs-2xl">{{ title }}</h1>
        </div>
        <div class="flex items-center header-links">
            <div class="h-user-name font-h">
                <p>{{ user.name }}</p>
                <p class="h-user-role">{{ user.role }} - DiagMan</p>
            </div>
            <RouterLink :to="{ name: 'finances' }" class="finances-link">
                <FinanceIcon /> Finances
            </RouterLink>
            <RouterLink
                :to="{ name: 'settings' }"
                class="h-icon-btn flex items-center"
            >
                <Icon size="24" viewBox="24">
                    <path
                        fill="currentColor"
                        d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
                    />
                </Icon>
            </RouterLink>
        </div>
    </div>
</template>
<style lang="scss">
.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .site-name {
        font-weight: bold;
        font-size: var(--fs-xl);
    }
    .h-icon-btn {
        background: transparent;
        color: var(--clr-black);
        padding: 5px;
    }
    .h-icon-btn:hover {
        color: var(--clr-accent);
    }
    .h-user-name {
        font-weight: bold;
        margin-right: 10px;
        font-size: var(--fs-md);

        .h-user-role {
            font-weight: normal;
            text-transform: capitalize;
            font-size: var(--fs-base);
        }
    }
    .header-links {
        gap: 10px;

        a {
            display: flex;
            align-items: center;
            gap: 5px;
            text-decoration: none;
            color: var(--clr-black);

            &:hover {
                color: var(--clr-accent);
            }
        }
    }
}
</style>
