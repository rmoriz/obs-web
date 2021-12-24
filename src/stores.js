import { writable } from 'svelte/store';

export const screenshotSettings = writable({
  timerValue: 1000,
  timerId: null,
  active: false,
  imageFormat: 'jpg',
});

export const obsConnection = writable({
  host: 'localhost:4444',
  password: '',
});

export const isConnected = writable(false);
export const isStudioMode = writable(false);
