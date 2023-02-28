<script setup lang="ts">
import TableX from '@/components/TableX.vue';

const TableInfo = {
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
        { no: 1, name: 'Some user', email: 'someuser@gmail.com' },
        { no: 2, name: 'Some user', email: 'someuser@gmail.com' },
        { no: 3, name: 'Some user', email: 'someuser@gmail.com' },
        { no: 4, name: 'Some user', email: 'someuser@gmail.com' },
        { no: 5, name: 'Some user', email: 'someuser@gmail.com' },
    ]
};
</script>
<template>
    <TableX :cols="TableInfo.cols" :data="TableInfo.data"/>
</template>