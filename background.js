const API_KEY = "YOUR_OPEN_AI_API_KEY";

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "aiDictionaryContextMenu",
    title: "Obter significado de '%s'",
    contexts: ["selection"],
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "aiDictionaryContextMenu") {
    const selectedText = info.selectionText
    chrome.tabs.sendMessage(tab.id, {
      action: "getDefinition",
      text: selectedText,
    });
  }
})

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDefinition") {
    getDefinitionFromAI(request.text)
      .then((definition) => sendResponse({ definition }))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  } else if (request.action === "pronounceWord") {
    pronounceWord(request.text);
  }
});

async function getDefinitionFromAI(text) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Defina '${text}' em poucas palavras.`,
        },
      ],
      temperature: 1,
      max_completion_tokens: 50,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch definition from AI");
  }

  const data = await response.json();
  return data;
}

function pronounceWord(text) {
  chrome.tts.speak(text, { lang: "pt-BR" });
}
