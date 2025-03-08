document.addEventListener("DOMContentLoaded", function () {
  const wordInput = document.getElementById("word-input");
  const searchButton = document.getElementById("search-button");
  const resultDiv = document.getElementById("result");
  const loadingDiv = document.getElementById("loading");

  searchButton.addEventListener("click", searchWord);
  wordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchWord();
    }
  });

  function searchWord() {
    const word = wordInput.value.trim();
    if (word) {
      showLoading(true);

      resultDiv.textContent = "";
      chrome.runtime.sendMessage(
        { action: "getDefinition", text: word },
        handleResponse
      );
    }
  }

  function handleResponse(response) {
    showLoading(false);
    
    if (response && response.definition) {
      const { message } = response.definition.choices[0];
      
      resultDiv.textContent = message.content;
    } else if (response && response.error) {
      resultDiv.textContent = "Error: " + response.error;
    } else {
      resultDiv.textContent = "An unexpected error occurred.";
    }
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingDiv.classList.remove("hidden");
      searchButton.disabled = true;
    } else {
      loadingDiv.classList.add("hidden");
      searchButton.disabled = false;
    }
  }
});
