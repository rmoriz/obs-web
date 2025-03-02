<script>
  const OBS_WEBSOCKET_LATEST_VERSION = '4.9.1'; // https://api.github.com/repos/Palakis/obs-websocket/releases/latest

  // Imports
  import { onMount } from 'svelte';
  import './style.scss';
  import {
    mdiAccessPoint,
    mdiAccessPointOff,
    mdiArrowSplitHorizontal,
    mdiBorderVertical,
    mdiFullscreen,
    mdiFullscreenExit,
    mdiPause,
    mdiPlayPause,
    mdiRecord,
    mdiStop,
  } from '@mdi/js';
  import Icon from 'mdi-svelte';
  import compareVersions from 'compare-versions';

  import { isConnected, isStudioMode, obsConnection, screenshotSettings } from './stores.js';

  // Import OBS-websocket
  import OBSWebSocket from 'obs-websocket-js';
  const obs = new OBSWebSocket();

  // Import local components
  import SceneView from './components/SceneView.svelte';
  import Screenshots from './components/Screenshots.svelte';
  import Footer from './components/Footer.svelte';

  onMount(async () => {
    /**
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
    **/

    // Request screen wakelock
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        // Re-request when coming back
        document.addEventListener('visibilitychange', async () => {
          if (document.visibilityState === 'visible') {
            wakeLock = await navigator.wakeLock.request('screen');
          }
        });
      } catch (e) {}
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      isFullScreen = document.fullscreenElement;
    });

    document.addEventListener('webkitfullscreenchange', () => {
      isFullScreen = document.webkitFullscreenElement;
    });

    document.addEventListener('msfullscreenchange', () => {
      isFullScreen = document.msFullscreenElement;
    });

    // Hamburger menu
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
      $navbarBurgers.forEach((el) => {
        el.addEventListener('click', () => {
          const target = document.getElementById(el.dataset.target);
          el.classList.toggle('is-active');
          target.classList.toggle('is-active');
        });
      });
    }

    if (document.location.hash) {
      console.log(`document.location.hash: ${document.location.hash}`);
      let urlParams = new URLSearchParams(window.location.hash.replace('#', '?'));

      if (urlParams.get('host')) {
        $obsConnection.host = urlParams.get('host');
      }

      if (urlParams.get('password')) {
        $obsConnection.password = urlParams.get('password');
      }

      await connect();
    }
  });

  // State
  let heartbeat,
    currentScene,
    currentPreviewScene,
    isFullScreen,
    isSceneOnTop,
    wakeLock = false;
  let scenes = [];
  let errorMessage = '';

  $: sceneChunks = Array(Math.ceil(scenes.length / 4))
    .fill()
    .map((_, index) => index * 4)
    .map((begin) => scenes.slice(begin, begin + 4));

  function toggleFullScreen() {
    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }
  }

  async function toggleStudioMode() {
    await sendCommand('ToggleStudioMode');
  }

  async function switchSceneView() {
    isSceneOnTop = !isSceneOnTop;
  }

  // OBS functions
  async function sendCommand(command, params) {
    try {
      return await obs.send(command, params || {});
    } catch (e) {
      console.log('Error sending command', command, ' - error is:', e);
      return {};
    }
  }

  async function setScene(e) {
    await sendCommand('SetCurrentScene', { 'scene-name': e.currentTarget.textContent });
  }

  async function transitionScene(e) {
    await sendCommand('TransitionToProgram');
  }

  async function setPreview(e) {
    await sendCommand('SetPreviewScene', { 'scene-name': e.currentTarget.textContent });
  }

  async function startStream() {
    await sendCommand('StartStreaming');
  }

  async function stopStream() {
    await sendCommand('StopStreaming');
  }

  async function startRecording() {
    await sendCommand('StartRecording');
  }

  async function stopRecording() {
    await sendCommand('StopRecording');
  }

  async function pauseRecording() {
    await sendCommand('PauseRecording');
  }

  async function resumeRecording() {
    await sendCommand('ResumeRecording');
  }

  async function updateScenes() {
    let data = await sendCommand('GetSceneList');
    currentScene = data.currentScene;
    scenes = data.scenes.filter((i) => {
      return i.name.indexOf('(hidden)') === -1;
    }); // Skip hidden scenes
    if ($isStudioMode) {
      obs
        .send('GetPreviewScene')
        .then((data) => (currentPreviewScene = data.name))
        .catch((_) => {
          // Switching off studio mode calls SwitchScenes, which will trigger this
          // before the socket has recieved confirmation of disabled studio mode.
        });
    }
    console.log('Scenes updated');
  }

  async function getStudioMode() {
    let data = await sendCommand('GetStudioModeStatus');
    isStudioMode.set(data && data.studioMode);
  }

  async function connect() {
    let host = $obsConnection.host;
    let password = $obsConnection.password;
    let secure = location.protocol === 'https:' || host.endsWith(':443');

    if (host.indexOf('://') !== -1) {
      let url = new URL(host);
      secure = url.protocol === 'wss:' || url.protocol === 'https:';
      host = url.hostname + ':' + (url.port ? url.port : secure ? 443 : 80);
    }
    console.log('Connecting to:', host, '- secure:', secure, '- using password:', password);
    await disconnect();
    $isConnected = false;

    try {
      await obs.connect({ address: host, password, secure });
    } catch (e) {
      console.log(`Error: $e`);
      errorMessage = e.description;
    }
  }

  async function disconnect() {
    await obs.disconnect();
    console.log('Disconnected');
    $isConnected = false;

    errorMessage = 'Disconnected';
  }

  async function hostkey(event) {
    if (event.key !== 'Enter') return;
    await connect();
    event.preventDefault();
  }

  // OBS events
  obs.on('ConnectionClosed', () => {
    $isConnected = false;
    console.log('Connection closed');
  });

  obs.on('AuthenticationSuccess', async () => {
    console.log('Connected: AuthenticationSuccess');

    $isConnected = true;

    const version = (await sendCommand('GetVersion')).obsWebsocketVersion || '';
    console.log('OBS-websocket version:', version);
    if (compareVersions(version, OBS_WEBSOCKET_LATEST_VERSION) < 0) {
      alert('You are running an outdated OBS-websocket (version ' + version + '), please upgrade to the latest version for full compatibility.');
    }
    await sendCommand('SetHeartbeat', { enable: true });
    await getStudioMode();
    await updateScenes();

    if ($screenshotSettings.active) {
      await getScreenshot();
    }
  });

  obs.on('AuthenticationFailure', async () => {
    console.log('Authentication failure');
    $obsConnection.password = prompt('Please enter your password:', $obsConnection.password);
    if (password === null) {
      $isConnected = false;
      $obsConnection.password = '';
      console.log('no password');
    } else {
      await connect();
    }
  });

  // Heartbeat
  obs.on('Heartbeat', (data) => {
    heartbeat = data;
  });

  // Scenes
  obs.on('SwitchScenes', async (data) => {
    console.log(`New Active Scene: ${data.sceneName}`);
    await updateScenes();
  });

  obs.on('error', (err) => {
    console.error('Socket error:', err);
  });

  obs.on('StudioModeSwitched', async (data) => {
    console.log(`Studio Mode: ${data.newState}`);
    isStudioMode.set(data.newState);
    if (!isStudioMode) {
      currentPreviewScene = false;
    } else {
      await updateScenes();
    }
  });

  obs.on('PreviewSceneChanged', async (data) => {
    console.log(`New Preview Scene: ${data.sceneName}`);
    await updateScenes();
  });
</script>

<svelte:head>
  <title>OBS-web - control OBS from anywhere</title>
</svelte:head>

<nav class="navbar is-primary" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item is-size-4 has-text-weight-bold" href="/">
      <img src="favicon.png" alt="OBS-web" class="rotate" />
      &nbsp; OBS-web
    </a>

    <!-- svelte-ignore a11y-missing-attribute -->
    <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navmenu">
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </a>
  </div>

  <div id="navmenu" class="navbar-menu">
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <!-- svelte-ignore a11y-missing-attribute -->
          {#if $isConnected}
            <a class="button is-info is-light" disabled>
              {#if heartbeat}
                {Math.round(heartbeat.stats.fps)} fps, {Math.round(heartbeat.stats['cpu-usage'])}% CPU, {heartbeat.stats['output-skipped-frames']} skipped frames
              {:else}Connected{/if}
            </a>

            <Screenshots {sendCommand} {currentScene} {currentPreviewScene} />

            {#if heartbeat && heartbeat.streaming}
              <a class="button is-danger" on:click={stopStream}>
                <span class="icon">
                  <Icon path={mdiAccessPointOff} />
                </span>
                <span>
                  Stop stream ({heartbeat.totalStreamTime} secs)
                </span>
              </a>
            {:else}
              <a class="button is-danger" on:click={startStream}>
                <span class="icon">
                  <Icon path={mdiAccessPoint} />
                </span>
                <span> Start stream </span>
              </a>
            {/if}
            {#if heartbeat && heartbeat.recording}
              {#if heartbeat.recordingPaused}
                <a class="button is-danger" on:click={resumeRecording}>
                  <span class="icon">
                    <Icon path={mdiPlayPause} />
                  </span>
                  <span> Resume recording </span>
                </a>
              {:else}
                <a class="button is-danger" on:click={pauseRecording}>
                  <span class="icon">
                    <Icon path={mdiPause} />
                  </span>
                  <span> Pause recording </span>
                </a>
              {/if}
              <a class="button is-danger" on:click={stopRecording}>
                <span class="icon">
                  <Icon path={mdiStop} />
                </span>
                <span>
                  Stop recording ({heartbeat.totalRecordTime} secs)
                </span>
              </a>
            {:else}
              <a class="button is-danger" on:click={startRecording}>
                <span class="icon">
                  <Icon path={mdiRecord} />
                </span>
                <span> Start recording </span>
              </a>
            {/if}
            <a class="button is-danger is-light" on:click={disconnect}>Disconnect</a>
            <a class:is-light={!$isStudioMode} class="button is-link" on:click={toggleStudioMode} title="Toggle Studio Mode">
              <span class="icon">
                <Icon path={mdiBorderVertical} />
              </span>
            </a>
            <a class:is-light={!isSceneOnTop} class="button is-link" on:click={switchSceneView} title="Show Scene on Top">
              <span class="icon">
                <Icon path={mdiArrowSplitHorizontal} />
              </span>
            </a>
          {:else}
            <a class="button is-danger" disabled>{errorMessage || 'Not connected'}</a>
          {/if}
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class:is-light={!isFullScreen} class="button is-link" on:click={toggleFullScreen} title="Toggle Fullscreen">
            <span class="icon">
              <Icon path={isFullScreen ? mdiFullscreenExit : mdiFullscreen} />
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>

<section class="section">
  <div class="container">
    {#if $isConnected}
      {#if isSceneOnTop}
        <SceneView {transitionScene} />
      {/if}
      {#each sceneChunks as chunk}
        <div class="tile is-ancestor">
          {#each chunk as sc}
            <div class="tile is-parent">
              <!-- svelte-ignore a11y-missing-attribute -->
              {#if currentScene == sc.name}
                <a class="tile is-child is-primary notification">
                  <p class="title has-text-centered is-size-6-mobile">{sc.name}</p>
                </a>
              {:else if $isStudioMode && currentPreviewScene == sc.name}
                <a on:click={setScene} class="tile is-child is-warning notification">
                  <p class="title has-text-centered is-size-6-mobile">{sc.name}</p>
                </a>
              {:else}
                <a on:click={$isStudioMode ? setPreview : setScene} class="tile is-child is-info notification">
                  <p class="title has-text-centered is-size-6-mobile">{sc.name}</p>
                </a>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
      {#if !isSceneOnTop}
        <SceneView {transitionScene} />
      {/if}
    {:else}
      <h1 class="subtitle">
        Welcome to
        <strong>OBS-web</strong>
        - the easiest way to control
        <a href="https://obsproject.com/" target="_blank">OBS</a>
        remotely!
      </h1>

      {#if document.location.protocol === 'https:'}
        <div class="notification is-danger">
          You are checking this page on a secure HTTPS connection. That's great, but it means you can
          <strong>only</strong>
          connect to WSS (secure websocket) hosts, for example OBS exposed with
          <a href="https://ngrok.com/">ngrok</a>
          or
          <a href="https://pagekite.net/">pagekite</a>
          . If you want to connect to a local OBS instance,
          <strong>
            <a href="http://{document.location.hostname}{document.location.port ? ':' + document.location.port : ''}{document.location.pathname}">
              please click here to load the non-secure version of this page
            </a>
          </strong>
          .
        </div>
      {/if}

      <p>To get started, enter your OBS host below and click "connect".</p>

      <form>
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input id="host" on:keyup={hostkey} bind:value={$obsConnection.host} class="input" type="text" placeholder={$obsConnection.host} />
          </p>
          <p class="control is-expanded">
            <input
              id="password"
              on:keyup={hostkey}
              bind:value={$obsConnection.password}
              class="input"
              type="password"
              placeholder={$obsConnection.password}
              autocomplete="current-password"
            />
          </p>
          <p class="control">
            <button on:click|preventDefault={connect} class="button is-success">Connect</button>
          </p>
        </div>
      </form>

      <p class="help">
        Make sure that the
        <a href="https://github.com/Palakis/obs-websocket/releases" target="_blank">obs-websocket plugin</a>
        is installed and enabled.
      </p>
    {/if}
  </div>
</section>

<Footer />
