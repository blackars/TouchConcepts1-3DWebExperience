import { createSignal, Show } from 'solid-js';
import './IntroWarning.css';

const StartPage = () => {
  const [isVisible, setIsVisible] = createSignal(true);

  const handlePlay = () => {
    //console.log("Play button clicked");
    const startPage = document.querySelector('.start-page-container');
    window.dispatchEvent(new CustomEvent("startAudio"));
    if (startPage) {
      handleStartGame();
      startPage.addEventListener('transitionend', () => {
        startPage.remove();
        //console.log("StartPage removed");
      });
      startPage.style.opacity = '0';
    }
  };

  const handleStartGame = () => {
    window.dispatchEvent(new CustomEvent('startGame'));
  };

  return (
    <Show when={isVisible()}>
      <div class="start-page-container">
        <img src="/warning.svg" alt="Advertencia" class="warning-icon" />
        <div class="intro-text">
          <p>WARNING: This content contains flashing lights and visual patterns</p>
          <p>that may potentially trigger seizures for viewers with photosensitive epilepsy or other conditions.</p>
          <p>Viewer discretion is advised.</p>
        </div>
        <div class="button-container">
          <button class="back-button" onClick={() => window.location.href = 'https://blackars.com'}>Back</button>
          <button class="play-button" onClick={handlePlay}>Play</button>
        </div>
      </div>
    </Show>
  );
};

export default StartPage;