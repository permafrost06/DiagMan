<script setup lang="ts">
import { TableHTMLAttributes, useSlots } from "vue";

import type { ColDetail } from "./types";

type TableState = "loading" | "error" | "ok";

interface TableProps extends /* @vue-ignore */ TableHTMLAttributes {
    data: Record<string, any>[];
    rows: number;
    state: TableState;
    header: {
        [column: string]: string | ColDetail;
    };
    visibleColumns: string[];
    trAttrs?: (row: Record<string, any>, index: number) => Record<string, any>;
    theadAttrs?: Record<string, any>;
    dragging?: string | null;
}
defineProps<TableProps>();

useSlots();
</script>
<template>
    <table v-bind="$attrs">
        <slot name="before-header"></slot>
        <tbody>
            <tr v-bind="theadAttrs">
                <template v-for="col in visibleColumns" :key="col">
                    <th v-if="col === dragging" class="dragging-indicator" :rowspan="data.length + 1"></th>
                    <slot
                        v-else
                        name="header"
                        :column="col"
                        :info="
                            typeof header[col] === 'string'
                                ? { label: header[col] }
                                : header[col]
                        "
                    ></slot>
                </template>
            </tr>
            <tr v-if="state === 'error'">
                <td :colspan="visibleColumns.length" style="text-align: center">
                    <slot name="error" :state="state"></slot>
                </td>
            </tr>
            <tr
                v-else-if="state === 'loading'"
                v-for="n in rows"
                :key="n"
                :class="`skeleton-${n % 4}`"
            >
                <template v-for="col in visibleColumns" :key="col">
                    <slot
                        :name="`col.${col}`"
                        :state="state"
                        :cell="null"
                        :row="null"
                    >
                        Loading...
                    </slot>
                </template>
            </tr>
            <tr
                v-else
                v-for="(item, index) in data"
                :key="index"
                v-bind="trAttrs?.(item, index)"
            >
                <template v-for="col in visibleColumns" :key="col">
                    <slot
                        v-if="col !== dragging"
                        :name="`col.${col}`"
                        :state="state"
                        :cell="item[col]"
                        :row="item"
                    ></slot>
                </template>
            </tr>
        </tbody>
    </table>
</template>
