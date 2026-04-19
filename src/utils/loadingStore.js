let count = 0;
let listeners = [];

export const loadingStore = {
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  start() {
    count++;
    this.notify();
  },
  stop() {
    count = Math.max(0, count - 1);
    this.notify();
  },
  notify() {
    const isLoading = count > 0;
    listeners.forEach((l) => l(isLoading));
  },
};
