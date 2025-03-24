import { createSignal, onMount } from 'solid-js';
import './ChatModal.css';

const ChatModal = (props) => {
  // Aseguramos que siempre tengamos un arreglo de mensajes
  const messages = props.textChunks && props.textChunks.length > 0 ? props.textChunks : ["No hay mensajes"];
  const [index, setIndex] = createSignal(0);
  
  onMount(() => {
    //console.log("ChatModal montado con", messages.length, "mensajes");
  });

  const handleNext = () => {
    //console.log("Avanzando mensaje:", index(), "de", messages.length - 1);
    if (index() < messages.length - 1) {
      setIndex(index() + 1);
    } else if (props.onClose) {
      //console.log("Último mensaje, cerrando modal");
      props.onClose();
    }
  };

  return (
    <div class="chat-modal-overlay">
      <div class="chat-modal-container">
        <div class="chat-modal-content">
          {messages[index()]}
        </div>
        <button class="chat-modal-next" onClick={handleNext}>
          { index() < messages.length - 1 ? ">" : "X" }
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
