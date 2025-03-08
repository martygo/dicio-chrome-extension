let popupElement = null;

document.addEventListener("mouseup", handleSelection);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDefinition") {
    chrome.runtime.sendMessage(
      { action: "getDefinition", text: request.text },
      handleResponse
    );
  }
});

function handleSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    chrome.runtime.sendMessage({ action: "getDefinition", text: selectedText }, handleResponse);
  } else if (popupElement) {
    removePopup();
  }
}

function handleResponse(response) {
  if (response && response.definition) {
    const { message } = response.definition.choices[0];
    
    showPopup(message.content);
  }
}

function showPopup(definition) {
  removePopup();

  popupElement = document.createElement("div");
  popupElement.id = "ai-dictionary-popup";
  popupElement.innerHTML = `
    <div class="popup-content">
      <button id="close-popup">×</button>
      <p>${definition}</p>
      <button id="pronounce-word">Pronunciar</button>
    </div>
  `;

  document.body.appendChild(popupElement);

  const closeButton = popupElement.querySelector("#close-popup");
  closeButton.addEventListener("click", removePopup);

  const pronounceButton = popupElement.querySelector("#pronounce-word");
  pronounceButton.addEventListener("click", pronounceWord);

  positionPopup();

  document.addEventListener("keydown", handleEscapeKey);
}

function removePopup() {
  if (popupElement) {
    popupElement.remove();
    popupElement = null;
    document.removeEventListener("keydown", handleEscapeKey);
  }
}

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    removePopup();
  }
}

function positionPopup() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  popupElement.style.position = "absolute";
  popupElement.style.top = `${rect.bottom + window.scrollY + 10}px`;
  popupElement.style.left = `${rect.left + window.scrollX}px`;
}

function pronounceWord() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage({ action: "pronounceWord", text: selectedText });
  }
}

// Add styles for the popup
const style = document.createElement("style");
style.textContent = `
  #ai-dictionary-popup {
    position: absolute;
    z-index: 10000;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px;
    max-width: 300px;
  }

  #ai-dictionary-popup .popup-content {
    position: relative;
  }

  #ai-dictionary-popup #close-popup {
    position: absolute;
    top: -5px;
    right: -5px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }

  #ai-dictionary-popup p {
    margin: 0 0 10px 0;
    font-size: 14px;
    line-height: 1.4;
  }

  #ai-dictionary-popup #pronounce-word {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 12px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
  }
`;
document.head.appendChild(style);
