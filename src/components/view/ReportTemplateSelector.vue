<script setup lang="ts">
import { ref, onMounted } from "vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import Loading from "@/Icons/Loading.vue";

function extractTextFromQuillDelta(quillJson: string): string {
    try {
        const delta = JSON.parse(quillJson);
        if (!delta.ops || !Array.isArray(delta.ops)) {
            return '';
        }
        return delta.ops
            .map((op: any) => {
                if (typeof op.insert === 'string') {
                    return op.insert;
                }
                return '';
            })
            .join('')
            .trim();
    } catch (e) {
        return '';
    }
}

interface Template {
    id: string;
    diagnosis: string;
    [key: string]: any;
}

interface Props {
    onSelectTemplate?: (template: Template) => void;
}

defineProps<Props>();

const templates = ref<Template[]>([]);
console.log(templates);
const isLoading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 20;

onMounted(async () => {
    await loadTemplates();
});

const loadTemplates = async () => {
    isLoading.value = true;
    const query = searchQuery.value
        ? `&diagnosis=${encodeURIComponent(searchQuery.value)}`
        : "";
    const res = await fetchApi(
        `${API_BASE}/report-templates?page=${currentPage.value}&limit=${limit}${query}`,
    );
    isLoading.value = false;

    if (res.success) {
        templates.value = res.rows;
        totalPages.value = Math.ceil((res.total || 0) / limit);
    } else {
        console.error(res.message || "Failed to load templates!");
    }
};

const onSearch = async () => {
    currentPage.value = 1;
    await loadTemplates();
};

const emit = defineEmits<{
    selectTemplate: [template: Template];
}>();

const selectTemplate = (template: Template) => {
    emit("selectTemplate", template);
};

const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        await loadTemplates();
    }
};
</script>

<template>
    <div class="template-selector-container">
        <div class="header">
            <h3>Report Templates</h3>
        </div>

        <div class="search-bar">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by diagnosis..."
                @keyup.enter.prevent="onSearch"
                @keydown.enter.prevent
            />
            <button @click="onSearch" class="btn-search">Search</button>
        </div>

        <div v-if="isLoading" class="loading-state">
            <Loading size="40" />
            <p>Loading templates...</p>
        </div>

        <div v-else-if="templates.length === 0" class="empty-state">
            <p>No templates found</p>
        </div>

        <div v-else class="templates-list">
            <div
                v-for="template in templates"
                :key="template.id"
                class="template-item"
                @click="selectTemplate(template)"
            >
                <div class="diagnosis">
                    {{ extractTextFromQuillDelta(template.diagnosis) || "Untitled" }}
                </div>
            </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn-pagination"
            >
                Previous
            </button>
            <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn-pagination"
            >
                Next
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.template-selector-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    border: 1px solid var(--clr-black);
    border-radius: 4px;
    background-color: var(--clr-white);
    overflow-y: auto;

    .header {
        h3 {
            margin: 0;
            font-size: var(--fs-lg);
            font-weight: 600;
        }
    }

    .search-bar {
        display: flex;
        gap: 10px;

        input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--clr-black);
            border-radius: 4px;
            font-size: var(--fs-md);

            &:focus {
                outline: none;
                border-color: var(--clr-primary);
            }
        }

        .btn-search {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;

            &:hover {
                background-color: var(--clr-primary-dark);
            }
        }
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 30px;
        color: var(--clr-text-secondary);
    }

    .empty-state {
        padding: 30px;
        text-align: center;
        color: var(--clr-text-secondary);
    }

    .templates-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .template-item {
            padding: 12px;
            border: 1px solid var(--clr-border);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background-color: var(--clr-light-gray);
                border-color: var(--clr-primary);
            }

            .diagnosis {
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--clr-border);

        .page-info {
            font-size: var(--fs-sm);
            color: var(--clr-text-secondary);
        }

        .btn-pagination {
            padding: 6px 12px;
            border: 1px solid var(--clr-black);
            border-radius: 4px;
            background-color: white;
            cursor: pointer;
            font-size: var(--fs-md);

            &:hover:not(:disabled) {
                background-color: var(--clr-light-gray);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
}
</style>
