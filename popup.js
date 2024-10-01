document.addEventListener('DOMContentLoaded', function () {
  const askButton = document.getElementById('askButton');
  const userInput = document.getElementById('userInput');
  const responseDiv = document.getElementById('response');

  askButton.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text === '') {
      responseDiv.textContent = 'Please enter a question.';
      return;
    }

    // Disable button while waiting for response
    askButton.disabled = true;
    askButton.textContent = 'Asking...';

    // Send message to background script
    chrome.runtime.sendMessage(
      { type: 'ASK_CHATGPT', message: text },
      (response) => {
        askButton.disabled = false;
        askButton.textContent = 'Ask ChatGPT';
        
        // Display response in the popup
        if (response && response.reply) {
          responseDiv.textContent = response.reply;
        } else {
          responseDiv.textContent = 'No response from ChatGPT.';
        }
      }
    );
  });
});
