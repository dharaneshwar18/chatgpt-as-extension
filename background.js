// background.js

// Create a context menu item that shows only when text is selected
chrome.contextMenus.create({
  id: "ask-chatgpt",
  title: "Ask ChatGPT",
  contexts: ["selection"], // Show only when text is selected
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ask-chatgpt" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    console.log("Selected text:", selectedText); // Log the selected text

    // Send the selected text to the content script to process
    chrome.tabs.sendMessage(tab.id, { type: "ASK_CHATGPT", message: selectedText }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        return; // Exit if there's an error
      }

      if (response && response.reply) {
        alert(`ChatGPT says: ${response.reply}`);
      } else {
        console.error('No valid response from content script.');
      }
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_CHATGPT") {
    const text = message.message;

    // Make a POST request to the local ChatGPT server with the selected text
    fetch('http://localhost:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.reply) {
          // Send the reply back to the sender
          sendResponse({ reply: data.reply });
        } else {
          console.error('Invalid response from ChatGPT API.');
          sendResponse({ reply: 'No valid response from ChatGPT.' });
        }
      })
      .catch((error) => {
        console.error('Error connecting to ChatGPT server:', error);
        sendResponse({ reply: 'Error connecting to ChatGPT.' });
      });

    // Return true to indicate asynchronous response handling
    return true;
  }
});
