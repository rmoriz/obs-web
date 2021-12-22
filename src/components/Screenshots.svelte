<script>
  import { mdiCamera, mdiCameraOff } from '@mdi/js';
  import Icon from 'mdi-svelte';

  import { connected, screenshotSettings, isStudioMode } from '../stores.js';

  async function enableScreenshots() {
    $screenshotSettings.active = true;
    getScreenshot();
  }

  async function disableScreenshots() {
    $screenshotSettings.active = false;
    clearTimeout($screenshotSettings.timerId);
    $screenshotSettings.timerId = null;

    document.querySelector('#program').className = 'is-hidden';

    if ($isStudioMode) {
      document.querySelector('#preview').className = 'is-hidden';
    }
  }

  async function getScreenshot() {
    if ($connected) {
      let data = await sendCommand('TakeSourceScreenshot', { sourceName: currentScene, embedPictureFormat: $screenshotSettings.imageFormat, width: 960, height: 540 });
      if (data && data.img) {
        document.querySelector('#program').src = data.img;
        document.querySelector('#program').className = '';
      }

      if ($isStudioMode) {
        let data = await sendCommand('TakeSourceScreenshot', { sourceName: currentPreviewScene, embedPictureFormat: $screenshotSettings.imageFormat, width: 960, height: 540 });
        if (data && data.img) {
          document.querySelector('#preview').src = data.img;
          document.querySelector('#preview').classList.remove('is-hidden');
        }
      }
    }

    $screenshotSettings.timerId = setTimeout(getScreenshot, $screenshotSettings.timerValue);
  }

  export let sendCommand;
  export let currentScene;
  export let currentPreviewScene;
</script>

{#if $screenshotSettings.active}
  <a class="button is-warning" on:click={disableScreenshots}>
    <span class="icon">
      <Icon path={mdiCameraOff} />
    </span>
    <span> Stop Screenshots </span>
  </a>
{:else}
  <a class="button is-warning is-light" on:click={enableScreenshots}>
    <span class="icon">
      <Icon path={mdiCamera} />
    </span>
    <span> Enable Screenshots </span>
  </a>
{/if}
