<script setup lang="ts">
</script>

<template>
  <header id="top-bar">
    <div class="left">
      <img alt="logo" class="logo" src="@/assets/logo.png"/>
      <div class="name">XD Anton Padova</div>
    </div>
  </header>
</template>

<style scoped>
  #top-bar {
    /* background-color: white; */
    height: 80px;
    display: flex;
    justify-content: space-between;

  background: var(--bg-topbar);
  color: var(--text-dark);
  box-shadow: var(--shadow-soft);
  }
  .left {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .logo {
    width: 50px;
    height: 50px;
  }
  .name {
    font-size: large;
    font-weight: bold;
    font-style: italic;
    color: #2563eb;
  }
</style>
