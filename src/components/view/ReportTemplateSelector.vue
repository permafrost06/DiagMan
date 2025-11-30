<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import Loading from "@/Icons/Loading.vue";
import { useUser } from "@/stores/user";

function extractTextFromQuillDelta(quillJson: string): string {
    try {
        const delta = JSON.parse(quillJson);
        if (!delta.ops || !Array.isArray(delta.ops)) {
            return "";
        }
        return delta.ops
            .map((op: any) => {
                if (typeof op.insert === "string") {
                    return op.insert;
                }
                return "";
            })
            .join("")
            .trim();
    } catch (e) {
        return "";
    }
}

interface Template {
    id: string;
    diagnosis: string;
    [key: string]: any;
}

interface Props {
    patientType?: "cyto" | "histo" | "";
    onSelectTemplate?: (template: Template) => void;
}

const props = defineProps<Props>();

const templates = ref<Template[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 20;
const hoveredTemplate = ref<Template | null>(null);
const hideAutogen = ref(false);

const user = useUser();

onMounted(async () => {
    if (props.patientType) {
        await loadTemplates();
    }
});

watch(
    () => props.patientType,
    async (newType) => {
        if (newType) {
            currentPage.value = 1;
            await loadTemplates();
        }
    },
);

const loadTemplates = async () => {
    isLoading.value = true;
    let query = "";

    if (searchQuery.value) {
        query += `&diagnosis=${encodeURIComponent(searchQuery.value)}`;
    }

    if (props.patientType) {
        query += `&type=${props.patientType}`;
    }

    if (hideAutogen.value) {
        query += `&hideAutogen=true`;
    }

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

const onToggleHideAutogen = async () => {
    currentPage.value = 1;
    await loadTemplates();
};

const emit = defineEmits<{
    selectTemplate: [template: Template];
    hoverTemplate: [template: Template | null];
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

const deleteTemplate = async (e: Event, templateId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const res = await fetchApi(`${API_BASE}/report-templates/${templateId}`, {
        method: "DELETE",
    });

    if (res.success) {
        // Remove from list
        templates.value = templates.value.filter((t) => t.id !== templateId);
        hoveredTemplate.value = null;
    } else {
        console.error(res.message || "Failed to delete template!");
    }
};

const toggleFavorite = async (
    e: Event,
    templateId: string,
    isFavorite: boolean,
) => {
    e.preventDefault();
    e.stopPropagation();

    if (user.role !== "admin") {
        return;
    }

    const method = isFavorite ? "DELETE" : "POST";
    const res = await fetchApi(
        `${API_BASE}/report-templates/${templateId}/favorite`,
        {
            method,
        },
    );

    if (res.success) {
        // Update the template's favorite status
        const template = templates.value.find((t) => t.id === templateId);
        if (template) {
            template.favorite = !isFavorite ? 1 : 0;
        }
    } else {
        console.error(res.message || "Failed to update favorite status!");
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

        <div class="filter-checkbox">
            <input
                id="hide-autogen"
                v-model="hideAutogen"
                type="checkbox"
                @change="onToggleHideAutogen"
            />
            <label for="hide-autogen">Hide auto-generated reports</label>
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
                @mouseenter="
                    () => {
                        hoveredTemplate = template;
                        emit('hoverTemplate', template);
                    }
                "
                @mouseleave="
                    () => {
                        hoveredTemplate = null;
                        emit('hoverTemplate', null);
                    }
                "
            >
                <div class="diagnosis">
                    <svg
                        v-if="template.autogen === 1 && template.favorite === 0"
                        width="20px"
                        height="20px"
                        viewBox="0 0 512 512"
                        id="icons"
                        xmlns="http://www.w3.org/2000/svg"
                        data-iconid="326818"
                        data-svgname="Sparkles outline"
                        class="ai-icon"
                    >
                        <path
                            d="M259.92,262.91,216.4,149.77a9,9,0,0,0-16.8,0L156.08,262.91a9,9,0,0,1-5.17,5.17L37.77,311.6a9,9,0,0,0,0,16.8l113.14,43.52a9,9,0,0,1,5.17,5.17L199.6,490.23a9,9,0,0,0,16.8,0l43.52-113.14a9,9,0,0,1,5.17-5.17L378.23,328.4a9,9,0,0,0,0-16.8L265.09,268.08A9,9,0,0,1,259.92,262.91Z"
                            fill="none"
                            stroke="#000000"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="32"
                        ></path>
                        <polygon
                            points="108 68 88 16 68 68 16 88 68 108 88 160 108 108 160 88 108 68"
                            fill="none"
                            stroke="#000000"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="32"
                        ></polygon>
                        <polygon
                            points="426.67 117.33 400 48 373.33 117.33 304 144 373.33 170.67 400 240 426.67 170.67 496 144 426.67 117.33"
                            fill="none"
                            stroke="#000000"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="32"
                        ></polygon>
                    </svg>
                    {{
                        extractTextFromQuillDelta(template.diagnosis) ||
                        "Untitled"
                    }}
                </div>
                <div class="template-actions">
                    <button
                        v-if="template.favorite === 1 || user.role === 'admin'"
                        class="favorite-btn"
                        @click="
                            toggleFavorite(
                                $event,
                                template.id,
                                template.favorite === 1,
                            )
                        "
                        :title="
                            template.favorite === 1
                                ? user.role === 'admin'
                                    ? 'Remove from favorites'
                                    : 'Favourite'
                                : 'Add to favorites'
                        "
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :class="{ filled: template.favorite === 1 }"
                        >
                            <polygon
                                points="12 2 15.09 10.26 24 10.35 17.77 16.01 20.16 24.02 12 18.35 3.84 24.02 6.23 16.01 0 10.35 8.91 10.26 12 2"
                            />
                        </svg>
                    </button>
                    <button
                        class="delete-btn"
                        @click="deleteTemplate($event, template.id)"
                        title="Hide this template"
                        v-if="user.role === 'admin'"
                    >
                        ✕
                    </button>
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

    .filter-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--fs-md);

        input[type="checkbox"] {
            cursor: pointer;
            width: 16px;
            height: 16px;
        }

        label {
            cursor: pointer;
            margin: 0;
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

        .template-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 12px;
            border: 1px solid var(--clr-border);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;

            .ai-icon {
                flex-shrink: 0;
            }

            &:hover {
                background-color: var(--clr-black);
                color: var(--clr-white);
                border-color: var(--clr-primary);

                .template-actions {
                    opacity: 1;
                }

                .ai-icon path,
                .ai-icon polygon {
                    stroke: white;
                }
            }

            .diagnosis {
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .template-actions {
                display: flex;
                gap: 4px;
                align-items: center;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .favorite-btn {
                flex-shrink: 0;
                padding: 4px 8px;
                background: transparent;
                border: none;
                color: inherit;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 25px;
                height: 25px;

                svg {
                    width: 100%;
                    height: 100%;
                    fill: transparent;
                    stroke: currentColor;
                    transition: all 0.2s ease;

                    &.filled {
                        fill: currentColor;
                    }
                }

                &:hover {
                    color: #ffc107;
                }
            }

            .delete-btn {
                flex-shrink: 0;
                padding: 4px 8px;
                background: transparent;
                border: none;
                color: inherit;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                    opacity: 1;
                    color: #ff4444;
                }
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
