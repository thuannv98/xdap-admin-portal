import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css';
import Aura from "@primeuix/themes/aura";
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import VueDnDKitPlugin, { type IPluginOptions } from '@vue-dnd-kit/core';

import { setupCalendar } from 'v-calendar';

import '@/assets/theme.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(ToastService);
app.use(ConfirmationService);
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: ".p-dark",
		}
	},
	locale: {
		startsWith: 'Bắt đầu với',
		contains: 'Chứa',
		notContains: 'Không chứa',
		endsWith: 'Kết thúc với',
		equals: 'Bằng',
		notEquals: 'Không bằng',
		noFilter: 'Không lọc',
		matchAll: 'Khớp tất cả',
		matchAny: 'Khớp bất kỳ',
		dateIs: 'Ngày là',
		dateIsNot: 'Ngày không phải là',
		dateBefore: 'Trước ngày',
		dateAfter: 'Sau ngày',
		apply: 'Áp dụng',
		clear: 'Xóa',
		addRule: 'Thêm quy tắc',
		removeRule: 'Xoá quy tắc',
		selectionMessage: '{0} mục đã chọn',

		//date
		firstDayOfWeek: 1,
		dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
		dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
		dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
		monthNames: [
			'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
			'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
		],
		monthNamesShort: [
			'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
			'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
		],
		today: 'Hôm nay',
		choose: 'Chọn',
		upload: 'Tải lên',
		cancel: 'Huỷ',

		pending: 'Đang chờ',
		completed: 'Đã hoàn tất',
	}
});
app.directive('tooltip', Tooltip);

app.use(VueDnDKitPlugin, {
  defaultOverlay: {
    styles: {
      // Optional custom styles for drag overlay
      opacity: 0.8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'none',
    },
  },
} as IPluginOptions);

import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

// Use plugin with optional defaults
app.use(VCalendar, {})


app.mount('#app')
