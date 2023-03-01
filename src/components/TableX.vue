<script setup lang="ts">

const props = withDefaults<TableXProps, {}>(defineProps<TableXProps>(), {
    width: 'auto'
});

const cols = ref<TableCol[]>(props.cols);

onMounted(()=>{
    window.addEventListener('mouseup', dragEnd);
    setEvts();
});

onUnmounted(()=>{
    window.removeEventListener('mouseup', dragEnd);
});

onUpdated(()=>{
    setEvts();
});

function addCol(evt: Event){
    //@ts-ignore
    const idx = parseInt(evt.target.parentElement.getAttribute('data-id')) + 1;
    const newArr = [];
    for(let i = 0; i < idx; i++){
        newArr.push(cols.value[i]);
    }
    newArr.push({
        label: 'New Col',
        name: 'new_col'
    });
    for(let i = idx; i < cols.value.length;i++){
        newArr.push(cols.value[i]);
    }
    cols.value = newArr;
}
</script>

<template>
    <div class="table-wrapper">
        <table cellspacing="0" ref="tableRef">
            <thead>
                <tr>
                    <th v-for="cprops, idx in cols"
                        :style="`width: ${cprops.width}`"
                        :class="cprops.thClass"
                        :data-id="idx">
                        {{ cprops.label }}
                        <button
                            class="new-col"
                            type="button"
                            @click="addCol">+</button>
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
    text-align: left;
    padding-left: 25px;
}
.expander{
    cursor: col-resize;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    z-index: 1;
    border-right: 1px solid #a7a7a7;
}
.expander.active{
    border-right: 2px solid rgb(64, 64, 255);
}

.new-col{
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    padding: 0;
    height: 15px;
    width: 15px;
    border-radius: 50%;
    border: none;
    background: white;
    box-shadow: 0 0 2px rgb(63, 63, 63);
    z-index: 2;
    cursor: pointer;
    margin-left: 5px;
    transition: all 300ms ease-in-out;
}
.new-col:hover{
    box-shadow: 0 0 3px black;
}
</style>
<script lang="ts">
/*Declearations had to be separated because of volar error*/

import { nextTick, onMounted, onUnmounted, onUpdated, ref } from 'vue';

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

const tableRef = ref<HTMLTableElement>();

function setEvts(){
    if(!tableRef.value){
        return;
    }
    const expandors = tableRef.value.querySelectorAll('th .expander');
    expandors.forEach(el=>{
        el.addEventListener('mousedown', dragStart);
    })
}

let initialX = 0, initialWidth = 0, activeEl:HTMLTableCellElement;
function drag(evt: MouseEvent){
    const distance = evt.x - initialX;
    activeEl.style.width = (initialWidth + distance) + 'px';
}

function dragStart(this:HTMLDivElement, evt: any){
    initialX = evt.x;
    activeEl = this.parentElement as HTMLTableCellElement;
    this.style.height = tableRef.value?.getBoundingClientRect().height + 'px';
    this.classList.add('active');

    initialWidth = activeEl.getBoundingClientRect().width;

    window.addEventListener('mousemove', drag);
}

function dragEnd(){
    if(initialX > 0){
        initialX = 0;
        activeEl.lastElementChild?.removeAttribute('style');
        activeEl.lastElementChild?.classList.remove('active');
        window.removeEventListener('mousemove', drag);
    }
}

</script>
