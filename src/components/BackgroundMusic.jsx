import { onMount, onCleanup } from 'solid-js';

const BackgroundMusic = () => {
  let audioEl;

  const handleStartAudio = () => {
    //console.log("Evento 'startAudio' recibido");
    if (audioEl) {
      //console.log("audioEl existe, paused:", audioEl.paused);
      audioEl.play()
        .then(() => {
        //  console.log("Audio reproduciéndose correctamente.");
        })
        .catch((e) => {
          console.warn("La reproducción del audio fue bloqueada:", e);
        });
    } else {
      console.warn("audioEl no está definido.");
    }
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      //console.log("BackgroundMusic montado, agregando listener 'startAudio'");
      window.addEventListener("startAudio", handleStartAudio);
    }
  });

  onCleanup(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener("startAudio", handleStartAudio);
    }
  });

  return (
    <audio
      ref={el => audioEl = el}
      src="/bgmusic.mp3"
      loop
      style={{ display: 'none' }}
    />
  );
};

export default BackgroundMusic;
