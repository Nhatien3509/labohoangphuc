type ToastFn = ((msg: string) => void) & { error: (msg: string) => void };

const toast: ToastFn = ((msg: string) => {
  console.log("[toast]", msg);
}) as ToastFn;

toast.error = (msg: string) => {
  console.error("[toast.error]", msg);
};

export default toast;
