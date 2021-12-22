import { writable } from 'svelte/store';

export const screenshotSettings = writable({
  timerValue: 1000,
  timerId: null,
  active: false,
  imageFormat: 'jpg',
});

export const connected = writable(false);
export const isStudioMode = writable(false);
