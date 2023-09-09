<template>
    This is home <br />
    <RouterLink :to="{ name: 'components' }">Components</RouterLink>
    <RouterLink :to="{ name: 'tests' }">Tests</RouterLink>
    <RouterLink :to="{ name: 'patients' }">Patients</RouterLink>
</template>
<style>
a {
    display: block;
}
</style>
