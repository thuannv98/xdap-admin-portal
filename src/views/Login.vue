<script lang="ts" setup>
import { ref } from 'vue';

import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Form } from '@primevue/forms';


import Panel from '@/components/Panel.vue';
import Table from '@/components/Table.vue';
import Input from '@/components/forms/Input.vue';
import Select from '@/components/forms/Select.vue';
import DatePicker from '@/components/forms/DatePicker.vue';
import RadioButton from '@/components/forms/RadioButton.vue';

import { authService } from '@/services/apis.service';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import z from 'zod';
import { useLoadingStore } from '@/stores/app';
import { useNotify } from '@/services/toast.service';

const loading = useLoadingStore();
const { notifySuccess, notifyError } = useNotify();

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();


const initialValues = ref({
  email: '',
  password: '',
});
const resolver = ref(zodResolver(
  z.object({
    email: z.string().email({ message: 'Email không hợp lệ.' }),
    password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu.' }),
  })
));

async function login(data: any) {
  loading.setLoading(true);
  try {
    await authService.login(data);
    await auth.checkSession();
    loading.setLoading(false);
    router.push({ path: '/'});
  } catch (err: any) {
    notifyError(err.message);
    loading.setLoading(false);
  }
}

async function onFormSubmit({ valid, values }: { valid: boolean, values: any }) {
  if (valid) {
    await login(values);
  }
};

</script>

<template>
  <div class="flex h-full">
    <div class="hidden lg:block lg:w-3/5 xl:w-2/3 overflow-hidden">
      <picture>
        <source srcset="@/assets/imgs/brand.png" media="(min-width: 1280px)" />
        <img src="@/assets/imgs/brand-sm.png" alt="Banner" class="h-full w-auto max-w-fit" />
      </picture>
    </div>
    <div class="w-full lg:w-2/5 xl:w-1/3 bg-white login-right flex justify-center shadow-2xl">
      <div class="w-full md:w-1/2 lg:w-full">
        
      <div class="intro py-[2rem]">
        <div class="flex justify-center">
          <img alt="logo" class="h-[5rem] mb-[2rem]" src="@/assets/imgs/logo.png" />
        </div>
        <h4 class="welcome mb-1 text-gray-900"> Chào mừng đến với<br /><span class="text-capitalize">Xứ đoàn Antôn Padova</span>! 👋🏻 </h4>
        <p class="mb-0 text-gray-700"> Đăng nhập để bắt đầu </p>
      </div>
        
      <Form ref="form" v-slot="$form" :initialValues :resolver @submit="onFormSubmit"
        class="flex flex-col w-full sm:flex-row sm:flex-wrap">
        <div class="py-3 w-full rounded-xl">
          <Input name="email" type="text" label="Email" fluid
            :validation=true :invalid="$form.email?.invalid" :errMsg="$form.email?.error?.message" />
        </div>
        <div class="py-3 w-full rounded-xl">
          <Input name="password" type="password" label="Password" fluid
            :validation=true :invalid="$form.password?.invalid" :errMsg="$form.password?.error?.message" />
        </div>
        <div class="py-3 w-full flex justify-end gap-2 items-center">
          <Button variant="text" label="Quên mật khẩu?" />
        </div>
        <div class="py-3 w-full">
          <Button class="!w-full" type="submit" severity="primary" label="Login" />
        </div>
      </Form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-right {
  padding: 3rem;
}
.intro {
  line-height: 1.375rem;
  font-size: .9375rem;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}
.intro .welcome {
  font-size: 1.5rem !important;
  font-weight: 500;
  line-height: 2.375rem;
  letter-spacing: normal !important;
}
.intro .text-capitalize {
  text-transform: capitalize!important;
}
</style>

