<script lang="ts">
/*Declearations had to be separated because of volar error*/

type TableCol = {
    label: string,
    name: string,
    className?: string,
    thClass?: string,
    width?: string
};
interface TableXProps{
    cols: TableCol[],
    data: any[]
}
</script>

<script setup lang="ts">
const props = defineProps<TableXProps>();
/*
props.cols.forEach((col, idx)=>{
    if(typeof col === 'string'){
        props.cols[idx] = {
            label: col
        }
    }
})
*/
</script>

<template>
    <div>
        <table>
            <colgroup>
                <col v-for="cprops in cols" :width="cprops.width"/>
            </colgroup>
            <thead>
                <tr>
                    <th v-for="cprops in cols" :class="cprops.thClass">{{ cprops.label }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in data">
                    <td v-for="cprops in cols" :class="cprops.className">{{ row[cprops.name] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>