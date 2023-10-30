<script setup lang="ts">
import { useSorter, type Sorting, type SortType } from "@/helpers/utils";

interface ColDetail {
    label: string;
    sort?: boolean;
    filter?: boolean;
}
interface Props {
    description: {
        [column: string]: string | ColDetail;
    };
    onSort: (sort: Sorting<string>) => void;
    onFilter: (column: string) => void;
    sortBy: string;
    sortOrder: SortType;
}
const props = defineProps<Props>();

const [sortState, sortFn] = useSorter(props.sortBy, props.sortOrder);

const doSort = (col: any): Sorting<string> => {
    sortFn(col);
    return sortState.value;
};
</script>

<template>
    <th v-for="(thInfo, colName) in description" :key="colName">
        <div class="th-actionable">
            <p>{{ (thInfo as any).label || thInfo }}</p>
            <div class="actions">
                <button
                    v-if="typeof thInfo === 'string' || thInfo.sort !== false"
                    @click="() => onSort(doSort(colName))"
                >
                    <svg
                        v-if="sortState.by !== colName"
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 2048 2048"
                    >
                        <path
                            fill="currentColor"
                            d="m1069 499l-90 90l-338-337l-1 1796H512l1-1799l-340 340l-90-90L576 6l493 493zm807 960l91 90l-493 493l-494-493l91-90l338 338l-1-1797h128l1 1798l339-339z"
                        />
                    </svg>
                    <svg
                        v-else-if="sortState.order === 'asc'"
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 15 15"
                    >
                        <path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M8 1v11.293l3.146-3.147l.708.708L7.5 14.207L3.146 9.854l.708-.708L7 12.293V1h1Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 15 15"
                    >
                        <path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="m7.5.793l4.354 4.353l-.707.708L8 2.707V14H7V2.707L3.854 5.854l-.708-.708L7.5.793Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
                <button
                    v-if="typeof thInfo === 'string' || thInfo.filter !== false"
                    @click="() => onFilter(colName as any)"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M10 14L4 5V3h16v2l-6 9v6l-4 2v-8Z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </th>
</template>
