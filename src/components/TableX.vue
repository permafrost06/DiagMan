<script setup lang="ts">

const tableRef = ref<HTMLTableElement>();


withDefaults<TableXProps, {}>(defineProps<TableXProps>(), {
    width: 'auto'
});

onMounted(()=>{
    window.addEventListener('mouseup', dragEnd);
    if(!tableRef.value){
        return;
    }
    const expandors = tableRef.value.querySelectorAll('th .expander');
    expandors.forEach(el=>{
        el.addEventListener('mousedown', dragStart);
    })
});

onUnmounted(()=>{
    window.removeEventListener('mouseup', dragEnd);
});


</script>

<template>
    <div class="table-wrapper">
        <table cellspacing="0" ref="tableRef">
            <thead>
                <tr>
                    <th v-for="cprops in cols" :style="`width: ${cprops.width}`" :class="cprops.thClass">
                        {{ cprops.label }}
                        <div class="expander"></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in data">
                    <td v-for="cprops in cols" :class="cprops.className">
                        {{ row[cprops.name] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
.table-wrapper{
    width: max-content;
    position: relative;
}
th, td{
    position: relative;
    padding: 0;
    padding-right: 5px;
    margin: 0;
}
.expander{
    cursor: col-resize;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    z-index: 1;
    background: red;
}
</style>
<script lang="ts">
/*Declearations had to be separated because of volar error*/

import { onMounted, onUnmounted, ref } from 'vue';

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
let initialX = 0, initialWidth = 0, activeEl:HTMLTableCellElement;
function drag(evt: MouseEvent){
    const distance = evt.x - initialX;
    activeEl.style.width = (initialWidth + distance) + 'px';
}

function dragStart(this:HTMLDivElement, evt: any){
    initialX = evt.x;
    activeEl = this.parentElement as HTMLTableCellElement;

    initialWidth = activeEl.getBoundingClientRect().width;

    window.addEventListener('mousemove', drag);
}

function dragEnd(){
    if(initialX > 0){
        initialX = 0;
        window.removeEventListener('mousemove', drag);
    }
}

</script>
