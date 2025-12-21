import { useToast } from "primevue/usetoast";

export function useNotify() {
  const toast = useToast();

  const notify = (severity: string, summary?: string, detail?: string, life?: number) => {
    toast.add({ severity, summary, detail, life: life || 3000 });
  };

  return {
    notifySuccess: (detail?: string, summary = 'Thành công', life?: number) => notify("success", summary, detail, life),
    notifyInfo: (detail?: string, summary = 'Thông báo', life?: number) => notify("info", summary, detail, life),
    notifyWarn: (detail?: string, summary = 'Cảnh báo', life?: number) => notify("warn", summary, detail, life),
    notifyError: (detail?: string, summary = 'Lỗi', life?: number) => notify("error", summary, detail, life),
  };
};
