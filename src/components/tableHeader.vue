<template>
  <th>
    <slot></slot>
  </th>
</template>

<style lang="scss">
thead {
  border-bottom: 1px solid #c4c4c4;
  box-shadow: 0 6px 4px -4px rgba(0, 0, 0, 0.15);
}

th {
  font-size: 1.2rem;
  font-weight: 400;
  text-align: left;
  padding: 0.5rem 1rem;
}

th div {
  margin-bottom: 0.5rem;
}
</style>
