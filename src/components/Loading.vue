<script setup lang="ts">
import { type PropType } from 'vue';
// @ts-ignore - vue-spinner doesn't have proper TypeScript exports
import RingLoader from 'vue-spinner/src/RingLoader.vue';

// const props = defineProps({
//   loading: Boolean,
//   color: { type: String, default: '#3B82F6' },
//   size: { type: String, default: '40px' },
//   margin: { type: String, default: '3px' },
// });
type Size = 'small' | 'normal' | 'large' | 'xlarge';

const props = defineProps({
  loading: Boolean,
  screen: Boolean,
  darkMode: Boolean,
  size: {
    type: String as PropType<Size>
  }
});

</script>

<template>
  <div :class="screen ? 'screen' : 'inline-block'" v-if="loading">
    <!-- <RingLoader :color :size :margin></RingLoader> -->
    <div :class="['spinner', {'dark': darkMode}, size !== 'normal' ? size : '']">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1px);
  z-index: 9999;
}

.spinner {
  width: 2rem;
  height: 2rem;
  display: inline-block;
  position: relative;
}
.spinner.small {
  width: 1rem;
  height: 1rem;
}
.spinner.large {
  width: 3rem;
  height: 3rem;
}
.spinner.xlarge {
  width: 4rem;
  height: 4rem;
}

.spinner div {
  width: 10%; /* Width of each bar */
  height: 28%; /* Height of each bar */
  background: #000; /* Color of the bars (adjust for light/dark mode) */
  position: absolute;
  left: 45%; /* Center the bars horizontally */
  top: 37%; /* Center the bars vertically */
  opacity: 0;
  border-radius: 50px; /* Rounded ends */
  animation: fade 1s linear infinite;
}

.spinner.dark div {
  background: #FFF; /* Color of the bars (adjust for light/dark mode) */
}

/* Position and delay each bar's animation */
.spinner div:nth-child(1)  { transform: rotate(0deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.9167s; }
.spinner div:nth-child(2)  { transform: rotate(30deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.8333s; }
.spinner div:nth-child(3)  { transform: rotate(60deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.75s; }
.spinner div:nth-child(4)  { transform: rotate(90deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.6667s; }
.spinner div:nth-child(5)  { transform: rotate(120deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.5833s; }
.spinner div:nth-child(6)  { transform: rotate(150deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.5s; }
.spinner div:nth-child(7)  { transform: rotate(180deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.4167s; }
.spinner div:nth-child(8)  { transform: rotate(210deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.3333s; }
.spinner div:nth-child(9)  { transform: rotate(240deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.25s; }
.spinner div:nth-child(10) { transform: rotate(270deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.1667s; }
.spinner div:nth-child(11) { transform: rotate(300deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: -0.0833s; }
.spinner div:nth-child(12) { transform: rotate(330deg) translate(0, calc(-36 / 28 * 100%)); animation-delay: 0s; }

@keyframes fade {
  0% { opacity: 1; }
  100% { opacity: 0.1; }
}

@-webkit-keyframes fade {
  0% { opacity: 1; }
  100% { opacity: 0.1; }
}
</style>
