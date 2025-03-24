// ParentComponent.jsx
import { createSignal, createEffect, onCleanup } from "solid-js";
import ChatModal from "./ChatModal";

const ParentComponent = () => {
  const [showModal, setShowModal] = createSignal(true);
  const [shouldRender, setShouldRender] = createSignal(true);

  createEffect(() => {
    if (!showModal()) {
      // Esperar un poco para que la animación de cierre termine
      setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
  });

  const handleClose = () => {
    //console.log("Modal cerrado");
    setShowModal(false);
  };

  return shouldRender() ? (
    <>
      {showModal() && (
        <ChatModal 
          textChunks={[
            "Welcome to The Nothing.",
            "Concepts changes in differents ways, trying to reach the perfect shapes.",
            "Touch, feel and live the ideas into the void, the shadows of time."
          ]}
          onClose={handleClose}
        />
      )}
    </>
  ) : null;
};

export default ParentComponent;
