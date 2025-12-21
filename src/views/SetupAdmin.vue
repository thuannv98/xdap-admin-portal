<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { Form } from '@primevue/forms';
import FloatLabel from 'primevue/floatlabel';
import Button from 'primevue/button';
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";

import Input from '@/components/forms/Input.vue';
import Loading from '@/components/Loading.vue';
import { authService } from "@/services/apis.service";
import { useNotify } from "@/services/toast.service";
import { useLoadingStore } from "@/stores/app";

const router = useRouter();
const loading = useLoadingStore();
const { notifySuccess, notifyError } = useNotify();

const setupCode = ref<any>({
  value: '',
  touched: false,
  verifying: false,
  verified: false,
});
const form = ref();
const initialValues = ref({
  setupCode: '',
  email: '',
  password: '',
  rePassword: '',
});
const validationMsg = {
  setupCode: 'Yêu cầu mã thiết lập.',
  email: 'Yêu cầu email hợp lệ.',
  password: 'Yêu cầu mật khẩu trên 8 ký tự.',
  rePassword: 'Mật khẩu không khớp.',
}
const resolver = ref(zodResolver(
  z.object({
    email: z.string().email({ message: validationMsg.email }),
    password: z.string().min(8, { message: validationMsg.password }),
    rePassword: z.string({ message: validationMsg.password }),
  }).refine((data) => data.password === data.rePassword, {
    message: validationMsg.rePassword,
    path: ['rePassword'],
  })
));
const passwordRules = ref(['Tối thiểu 8 ký tự']);

async function checkToken() {
  setupCode.value.touched = true;
  const token = setupCode.value.value;
  if (!token) {
    return;
  }
  try {
    setupCode.value.verifying = true;
    const status = await authService.verifySetupToken(token);
    if (status.valid) {
      setupCode.value.verified = true;
    }
    setupCode.value.verifying = false;
  } catch (error) {
    notifyError('Có lỗi xảy ra. Vui lòng thử lại.');
    setupCode.value.verifying = false;
  }
}


async function onFormSubmit({ valid, values }: { valid: boolean, values: any }) {
  if (!valid) {
    return;
  }
  try {
    loading.setLoading(true);
    const data = await authService.setupAdmin({
      email: values.email,
      password: values.password
    });
    loading.setLoading(false);
    notifySuccess('Chuyển hướng đăng nhập sau 3 giây', 'Thiết lập tài khoản thành công!', 3000);
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.push({ name: 'login' });
  } catch (error) {
    notifyError('Có lỗi xảy ra. Vui lòng thử lại');
    loading.setLoading(false);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-[3rem]">
    <h1 class="text-4xl text-gray-900 font-bold mb-8 animate-pulse">
      Thiết lập tài khoản điều hành
    </h1>
    <p class="text-gray-700 text-lg mb-8">
      Bắt đầu quản lý Xứ Đoàn của bạn từ đây. Thiết lập tài khoản của người điều hành Xứ Đoàn!
    </p>
    <div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/2 xl:w-1/3">
      <div class="w-full lg:w-1/2 p-1 pb-[2rem] mx-auto">
        <IconField>
          <Input v-model="setupCode.value" type="text" label="Mã thiết lập" help="Liên hệ quản trị viên để nhận mã." fluid class="w-full" 
            :validation=true :invalid="setupCode.touched && !setupCode.value" :errMsg="validationMsg.setupCode"
            :pt="{ message: { class: 'absolute pl-2' } }" @value-change="setupCode.touched = true" @keyup.enter="checkToken"/>
          <InputIcon>
            <Loading v-if="setupCode.verifying" :loading="true" size="small" />
            <i v-else class="pi pi-arrow-right" style="cursor: pointer;" @click="checkToken"></i>
          </InputIcon>
        </IconField>
      </div>
      <Form ref="form" v-slot="$form" :resolver :initialValues @submit="onFormSubmit"
      class="w-full">

        <Transition name="fade-slide">
        <div v-if="setupCode.verified" class="w-full flex flex-row flex-wrap">
          <div class="w-full">
            <div class="w-full lg:w-1/2 p-2 mx-auto">
              <Input name="email" type="text" label="Email" fluid
                :validation=true :invalid="$form.email?.invalid" :errMsg="$form.email?.error?.message" />
            </div>
          </div>
          <div class="w-full lg:w-1/2 p-2">
            <Input name="password" password :passwordRules label="Mật khẩu" fluid
              :validation=true :invalid="$form.password?.invalid" :errMsg="$form.password?.error?.message" />
          </div>
          <div class="w-full lg:w-1/2 p-2">
            <Input name="rePassword" password :passwordRules label="Nhập lại mật khẩu" fluid
              :validation=true :invalid="$form.rePassword?.invalid" :errMsg="$form.rePassword?.error?.message" />
          </div>
          <div class="w-full pt-4 flex justify-around">
            <Button type="submit" severity="primary" label="Gửi" />
          </div>
        </div>
        </Transition>
      </Form>
    </div>
  </div>
</template>

<style scoped>
  .fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.ios-spinner {
  /* Adjust size as needed */
  width: 50px;
  height: 50px;
  display: inline-block;
  position: relative;
}

.ios-spinner div {
    width: 6%; /* Width of each bar */
    height: 16%; /* Height of each bar */
    background: #000; /* Color of the bars (adjust for light/dark mode) */
    position: absolute;
    left: 49%; /* Center the bars horizontally */
    top: 43%; /* Center the bars vertically */
    opacity: 0;
    border-radius: 50px; /* Rounded ends */
    animation: fade 1s linear infinite;
}

/* Position and delay each bar's animation */
.ios-spinner div:nth-child(1)  { transform: rotate(0deg) translate(0, -130%); animation-delay: -0.9167s; }
.ios-spinner div:nth-child(2)  { transform: rotate(30deg) translate(0, -130%); animation-delay: -0.8333s; }
.ios-spinner div:nth-child(3)  { transform: rotate(60deg) translate(0, -130%); animation-delay: -0.75s; }
.ios-spinner div:nth-child(4)  { transform: rotate(90deg) translate(0, -130%); animation-delay: -0.6667s; }
.ios-spinner div:nth-child(5)  { transform: rotate(120deg) translate(0, -130%); animation-delay: -0.5833s; }
.ios-spinner div:nth-child(6)  { transform: rotate(150deg) translate(0, -130%); animation-delay: -0.5s; }
.ios-spinner div:nth-child(7)  { transform: rotate(180deg) translate(0, -130%); animation-delay: -0.4167s; }
.ios-spinner div:nth-child(8)  { transform: rotate(210deg) translate(0, -130%); animation-delay: -0.3333s; }
.ios-spinner div:nth-child(9)  { transform: rotate(240deg) translate(0, -130%); animation-delay: -0.25s; }
.ios-spinner div:nth-child(10) { transform: rotate(270deg) translate(0, -130%); animation-delay: -0.1667s; }
.ios-spinner div:nth-child(11) { transform: rotate(300deg) translate(0, -130%); animation-delay: -0.0833s; }
.ios-spinner div:nth-child(12) { transform: rotate(330deg) translate(0, -130%); animation-delay: 0s; }


/* Keyframes for the fading animation */
@keyframes fade {
    0% { opacity: 1; }
    100% { opacity: 0.1; }
}

/* Ensure cross-browser compatibility for keyframes */
@-webkit-keyframes fade {
    0% { opacity: 1; }
    100% { opacity: 0.1; }
}
</style>
