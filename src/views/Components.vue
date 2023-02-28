<script setup lang="ts">
import CmpLink from '@/components/CmpLink.vue';
import { ref, shallowRef, watch, type Component } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const cmp = shallowRef<Component>();
const cmpName = ref<string>('');

checkCmp();
watch(route, checkCmp)
async function checkCmp(){
    if(!route.params?.name){
        cmp.value = undefined;
        cmpName.value = '';
        return;
    }
    cmpName.value = route.params.name as string;
    cmp.value = (await import(/* @vite-ignore */ `@/components/${cmpName.value}.vue`)).default;
}

const components:{[key: string]: any} = {
    TableX: {
        cols: [
            {
                name: 'no',
                label: 'No'
            },
            {
                name: 'name',
                label: 'Name'
            },
            {
                name: 'email',
                label: 'Email',
                width: '50%'
            }
        ],
        data: [
            {no: 1, name: 'Some user', email: 'someuser@gmail.com'},
            {no: 2, name: 'Some user', email: 'someuser@gmail.com'},
            {no: 3, name: 'Some user', email: 'someuser@gmail.com'},
            {no: 4, name: 'Some user', email: 'someuser@gmail.com'},
            {no: 5, name: 'Some user', email: 'someuser@gmail.com'},
        ]
    }
}

</script>
<template>
    <header>
        Components
    </header>
    <main v-if="!cmp" class="cmps">
        <CmpLink
            v-for="cmp in Object.keys(components)"
            :name="cmp">{{ cmp }}</CmpLink>
    </main>
    <main class="cmp" v-else>
        <component :is="cmp" v-bind="components[cmpName] || {}"></component>
    </main>
</template>
<style scoped>
header{
    position: sticky;
    top: 0;
    box-shadow: 0 1px 3px gray;
    padding: 15px 15px;
    margin: 0;
    font-size: var(--fs-lg);
}
.cmps{
    display: grid;
    padding: 10px;
}
.cmps a{
    padding: 10px;
    border: 1px solid rgb(0, 0, 0);
}

.cmp{
    padding: 10px;
}
@media (min-width: 500px)  {
    .cmps{
        grid-auto-columns: 50%;
        padding: 50px 100px;
    }
}
</style>