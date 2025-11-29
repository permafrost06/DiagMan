<script setup lang="ts">
import DotsVertical from "@/Icons/dots-vertical.svg";
import Loading from "@/Icons/Loading.vue";
import { useUser } from "@/stores/user";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import Print from "@/Icons/print.svg";
import Edit from "@/Icons/edit.svg";
import Delete from "@/Icons/delete.svg";
import Send from "@/Icons/send.svg";

const props = defineProps<{
    patient: Record<string, any>;
}>();

const user = useUser();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const isSmsSending = ref<boolean>(false);
const isLocking = ref<boolean>(false);
const isDelivering = ref<boolean>(false);
const dropdownPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const dropdownMenuRef = ref<HTMLElement | null>(null);

const dispatchOpenEvent = () => {
    const event = new CustomEvent("patient-dropdown-open", {
        detail: props.patient,
    });
    document.dispatchEvent(event);
};

const setDropdownPosition = (evt: MouseEvent) => {
    const MARGIN = 10;

    let x = evt.clientX;
    let y = evt.clientY;

    nextTick(() => {
        if (!dropdownMenuRef.value) return;

        const dropdownRect = dropdownMenuRef.value.getBoundingClientRect();
        const { width, height } = dropdownRect;

        if (window.innerWidth - x < width + MARGIN) {
            x = x - width;
        }

        if (x < MARGIN) {
            x = MARGIN;
        }

        if (window.innerHeight - y < height + MARGIN) {
            y = y - height;
        }

        if (y < MARGIN) {
            y = MARGIN;
        }

        dropdownPosition.value = { x, y };
    });

    dropdownPosition.value = { x, y };
};

const toggleDropdown = (evt: MouseEvent) => {
    evt.stopPropagation();
    isOpen.value = !isOpen.value;
    setDropdownPosition(evt);
    if (isOpen.value) {
        dispatchOpenEvent();
    }
};

const closeDropdown = (evt?: CustomEvent) => {
    if (!evt) {
        isOpen.value = false;
        return;
    }
    if (evt.detail.id !== props.patient.id) {
        isOpen.value = false;
    }
};

const handleClickOutside = (evt: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(evt.target as Node)) {
        closeDropdown();
    }
};

const handleContextMenu = (evt: MouseEvent) => {
    evt.preventDefault();
    isOpen.value = true;
    setDropdownPosition(evt);
    dispatchOpenEvent();
};

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener(
        "patient-dropdown-open",
        closeDropdown as EventListener,
    );
    if (!dropdownRef.value) {
        return;
    }
    dropdownRef.value
        .closest("tr")
        ?.addEventListener("contextmenu", handleContextMenu);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener(
        "patient-dropdown-open",
        closeDropdown as EventListener,
    );
    if (!dropdownRef.value) {
        return;
    }
    dropdownRef.value
        .closest("tr")
        ?.removeEventListener("contextmenu", handleContextMenu);
});

const toggleLock = async (patient: any) => {
    if (isLocking.value) {
        return;
    }
    isLocking.value = true;
    const res = await fetchApi(
        API_BASE + "/reports/lock/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        },
    );
    isLocking.value = false;
    if (!res.success) {
        console.error(res.message || "Toggling report lock failed!");
        return;
    }
    patient.locked = !patient.locked;
};

const deliverReport = async (patient: any) => {
    if (isDelivering.value) {
        return;
    }
    isDelivering.value = true;
    const res = await fetchApi(
        API_BASE + "/reports/deliver/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        },
    );
    isDelivering.value = false;
    if (!res.success) {
        console.error(res.message || "Delivering report failed!");
        return;
    }
    patient.status = "delivered";
};

const unDeliverReport = async (patient: any) => {
    if (isDelivering.value) {
        return;
    }
    isDelivering.value = true;
    const res = await fetchApi(
        API_BASE + "/reports/un-deliver/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        },
    );
    isDelivering.value = false;
    if (!res.success) {
        console.error(res.message || "Unmarking as delivered failed!");
        return;
    }
    patient.status = res.data.status;
};

const sendSms = async (patient: any) => {
    if (isSmsSending.value) {
        return;
    }
    isSmsSending.value = true;
    const res = await fetchApi(
        API_BASE + "/sms/" + encodeURIComponent(patient.id),
        {
            method: "POST",
        },
    );
    isSmsSending.value = false;
    if (!res.success) {
        console.error(res.message || "Sending sms failed!");
        return;
    }
    patient.sms_sent = true;
};
</script>

<template>
    <div ref="dropdownRef" class="dropdown-container">
        <button class="dropdown-trigger" @click="toggleDropdown">
            <DotsVertical />
        </button>

        <div
            v-if="isOpen"
            ref="dropdownMenuRef"
            class="dropdown-menu"
            :style="{
                left: dropdownPosition.x + 'px',
                top: dropdownPosition.y + 'px',
            }"
            @click.stop
        >
            <div class="dropdown-section">
                <RouterLink
                    v-if="patient.locked"
                    :to="{
                        name: 'report.print',
                        params: { id: patient.id },
                    }"
                    class="dropdown-item"
                    @click="closeDropdown"
                >
                    <Print />
                    Print Report
                </RouterLink>
                <RouterLink
                    :to="{
                        name: 'patients.invoice',
                        params: { id: patient.id },
                    }"
                    class="dropdown-item"
                    @click="closeDropdown"
                >
                    <Print />
                    Print Invoice
                </RouterLink>
            </div>

            <div class="dropdown-section">
                <RouterLink
                    :to="{
                        name: 'patients.edit',
                        params: { id: patient.id },
                    }"
                    class="dropdown-item"
                    @click="closeDropdown"
                >
                    <Edit />
                    Edit Patient
                </RouterLink>
            </div>

            <div
                class="dropdown-section"
                v-if="
                    user.isAdmin &&
                    patient.is_reported &&
                    patient.status !== 'delivered'
                "
            >
                <button
                    class="dropdown-item"
                    @click="
                        () => {
                            toggleLock(patient);
                            closeDropdown();
                        }
                    "
                >
                    <Loading size="15" v-if="isLocking" />
                    {{ patient.locked ? "Unlock" : "Lock" }}
                </button>

                <template v-if="patient.locked">
                    <button
                        v-if="patient.status !== 'delivered'"
                        class="dropdown-item"
                        @click="
                            () => {
                                deliverReport(patient);
                                closeDropdown();
                            }
                        "
                    >
                        <Loading size="15" v-if="isDelivering" />
                        Archive
                    </button>
                    <button
                        v-else
                        class="dropdown-item"
                        @click="
                            () => {
                                unDeliverReport(patient);
                                closeDropdown();
                            }
                        "
                    >
                        <Loading size="15" v-if="isDelivering" />
                        Unarchive
                    </button>
                </template>
            </div>

            <div class="dropdown-section">
                <button
                    class="dropdown-item"
                    @click="
                        (evt) => {
                            evt.stopPropagation();
                            sendSms(patient);
                        }
                    "
                >
                    <template v-if="isSmsSending">
                        <Loading size="15" />
                        Sending...
                    </template>
                    <template v-else>
                        <Send />
                        Send SMS
                    </template>
                </button>
            </div>
            <div class="dropdown-section">
                <button
                    class="dropdown-item danger"
                    @click="
                        () => {
                            $emit('delete', patient);
                            closeDropdown();
                        }
                    "
                >
                    <Delete />
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dropdown-container {
    position: relative;
}

.dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 15px;
    font-weight: 600;
    background: transparent;
    color: var(--clr-black);
    border: 1px solid var(--clr-black);
    cursor: pointer;
    margin: 0;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
    }
}

.dropdown-menu {
    position: fixed;
    top: 100%;
    right: 0;
    min-width: 180px;
    width: max-content;
    background: var(--clr-white);
    border: 1px solid var(--clr-black);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 5px;
    padding: 0;
    margin: 5px 0 0;
    list-style: none;
}

.dropdown-section {
    border-bottom: 1px solid var(--clr-black);
    margin: 0;

    &:last-child {
        border-bottom: none;
    }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 15px;
    color: var(--clr-black);
    background: transparent;
    text-decoration: none;
    font-size: var(--fs-base);
    font-weight: normal;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
        outline: none;
    }

    &.danger {
        color: var(--clr-danger);

        &:hover {
            background: rgba(255, 0, 0, 0.05);
        }
    }
}
</style>
