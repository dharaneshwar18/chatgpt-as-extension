// Create the chatbot UI and append it to the body
const createChatBotUI = () => {
  // Check if the UI already exists
  if (document.getElementById('chatbot')) {
    // Reassign the event listener for the close button in case it's lost or overridden
    document.getElementById('chatbot-close').addEventListener('click', () => {
      document.getElementById('chatbot').style.display = 'none';
    });
    return; // Exit if the chatbot already exists
  }

  const botContainer = document.createElement('div');
  botContainer.id = 'chatbot';
  botContainer.innerHTML = `
    <div id="chatbot-header"> Kratos <span id="chatbot-close">X</span></div>
    <div id="chatbot-content">
      <div id="chatbot-messages"></div>
      <div id="chatbot-input-container">
        <textarea id="chatbot-input" placeholder="Type your message here..."></textarea>
        <button id="chatbot-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(botContainer);

  const style = document.createElement('style');
  style.innerHTML =   style.innerHTML = `
  #chatbot {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    height: 520px;
    background: #f5f5f5;
    border: 1px solid black;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
  }
  #chatbot-header {
    background-color: #444;
    color: white;
    padding: 10px;
    border-radius: 5px 5px 0 0;
    font-weight: bold;
    text-align: center;
    position: relative;
  }
  #chatbot-close {
    position: absolute;
    top: 5px;
    right: 10px;
    cursor: pointer;
    color: white;
  }
  #chatbot-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
  #chatbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background-color: #ffffff;
    border-radius: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
  }
  .message {
    padding: 8px 12px;
    border-radius: 10px;
    margin-bottom: 8px;
    width: fit-content;
    max-width: 80%;
    word-wrap: break-word;
    font-size: 14px;
  }
  .user-message {
    background-color: #d1e7dd;
    align-self: flex-end;
    color: #0f5132;
  }
  .bot-message {
    background-color: #f1f1f1;
    align-self: flex-start;
    color: #333;
  }
  #chatbot-input-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    background-color: #f5f5f5;
    border-top: 1px solid #ccc;
  }
  #chatbot-input {
    flex: 1;
    height: 45px; /* Increased to make the input box taller */
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 8px;
    font-size: 14px;
    color: black;
    resize: none;
    outline: none;
    background-color: #fafafa;
    box-sizing: border-box; /* Ensure proper sizing */
  }
  #chatbot-send {
    height: 60px; /* Match the height of the input */
    width: 70px; /* Slightly larger width */
    background-color: #444;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;
  }
  #chatbot-send:hover {
    background-color: #333;
  }
  #chatbot-send:active {
    transform: scale(0.98);
  }
`;

  document.head.appendChild(style);

  // Event listener for the close button
  document.getElementById('chatbot-close').addEventListener('click', () => {
    document.getElementById('chatbot').style.display = 'none';
  });

  // Event listener for send button
  document.getElementById('chatbot-send').addEventListener('click', () => {
    const userMessage = document.getElementById('chatbot-input').value;
    if (userMessage.trim()) {
      addMessage('You', userMessage); // Add user's message to the UI
      sendMessageToChatGPT(userMessage);
      document.getElementById('chatbot-input').value = '';  // Clear input field
    }
  });

  // Drag functionality
  let isDragging = false;
  let offset = { x: 0, y: 0 };

  const header = document.getElementById('chatbot-header');

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offset.x = e.clientX - botContainer.getBoundingClientRect().left;
    offset.y = e.clientY - botContainer.getBoundingClientRect().top;
    document.body.style.cursor = 'move'; // Change cursor while dragging
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      botContainer.style.left = `${e.clientX - offset.x}px`;
      botContainer.style.top = `${e.clientY - offset.y}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'default'; // Restore cursor after dragging
  });
};

// Function to add message to the chatbot UI
const addMessage = (sender, message) => {
  const messagesContainer = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  if (sender === 'You') {
    messageDiv.classList.add('user-message');
  } else {
    messageDiv.classList.add('bot-message');
  }

  messageDiv.innerHTML = `<b>${sender}:</b> ${message}`;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
};

// Function to send message to ChatGPT and receive a response
const sendMessageToChatGPT = (message, callback = null) => {
  // Show loading cursor
  showLoadingCursor();

  // Send the selected message to the background script for processing
  chrome.runtime.sendMessage({ type: "ASK_CHATGPT", message: message }, (response) => {
    if (callback) {
      callback(response);  // Handle response if a callback is passed
    } else if (response && response.reply) {
      addMessage('Kratos', response.reply); // Add bot's response to the UI
    } else {
      console.error("No valid response from background script.");
      addMessage('Kratos', "Error connecting to the server."); // Display error message in the chat
    }
    restoreCursor();
  });
};

// Function to change the cursor to "loading"
const showLoadingCursor = () => {
  const style = document.createElement("style");
  style.id = "cursor_wait";
  style.innerHTML = `* {cursor: wait;}`;
  document.head.appendChild(style);
};

// Function to restore the default cursor
const restoreCursor = () => {
  const loadingStyle = document.getElementById("cursor_wait");
  if (loadingStyle) {
    loadingStyle.remove();
  }
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_CHATGPT") {
    console.log("Message received from background.js", message);

    // Use the selected text sent by background.js
    const text = message.message.trim();

    // Ensure the text is not empty
    if (!text) {
      alert("No text found. Please select some text.");
      return;
    }

    // Check if the selected text is from an input or textarea element
    const activeElement = document.activeElement;
    if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") {
      sendMessageToChatGPT(text, (response) => {
        if (response && response.reply) {
          activeElement.value += ` ${response.reply}`;  // Append the bot's response to the input field
        } else {
          activeElement.value += " [Error fetching response]";
        }
      });
    } else {
      // Create and display the chatbot UI
      createChatBotUI();
      document.getElementById('chatbot').style.display = 'block';  // Show the chatbot UI

      // Send the selected text to ChatGPT and handle the response in the chatbot
      addMessage('You', text);  // Display the selected text in the chatbot
      sendMessageToChatGPT(text);
    }
  }
});


// Create floating icon and menu
const createFloatingIcon = () => {
  // Create the floating icon
  const icon = document.createElement('div');
  icon.id = 'floating-icon';
  icon.innerHTML = '⚙️'; // Floating icon
  icon.style.position = 'fixed';
  icon.style.bottom = '20px';
  icon.style.right = '20px';
  icon.style.width = '60px'; 
  icon.style.height = '60px'; 
  icon.style.backgroundColor = 'black'; 
  icon.style.color = 'white';
  icon.style.textAlign = 'center';
  icon.style.lineHeight = '60px'; 
  icon.style.borderRadius = '50%';
  icon.style.cursor = 'pointer';
  icon.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  document.body.appendChild(icon);

  // Create the floating menu
  const menu = document.createElement('div');
  menu.id = 'floating-menu';
  menu.innerHTML = `
    <div id="joke-btn">Tell a Joke</div>
    <div id="unit-converter-btn">Unit Converter</div>
    <div id="calculator-btn">Calculator</div>
  `;
  menu.style.position = 'fixed';
  menu.style.bottom = '80px';
  menu.style.right = '20px';
  menu.style.backgroundColor = '#333';  // Darker background for better visibility
  menu.style.color = 'white';
  menu.style.padding = '10px';
  menu.style.border = '1px solid #444';
  menu.style.borderRadius = '5px';
  menu.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  menu.style.display = 'none'; 
  document.body.appendChild(menu);

  // Menu hover and style effects
  menu.querySelectorAll('div').forEach(item => {
    item.style.padding = '8px';
    item.style.cursor = 'pointer';
    item.addEventListener('mouseover', () => {
      item.style.backgroundColor = '#444';  // Highlight item on hover
    });
    item.addEventListener('mouseout', () => {
      item.style.backgroundColor = '#333';  // Reset after hover
    });
  });

  // Toggle menu visibility on icon click
  icon.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  // Add functionality for menu items
  document.getElementById('joke-btn').addEventListener('click', tellJoke);
  document.getElementById('unit-converter-btn').addEventListener('click', convertUnits);
  document.getElementById('calculator-btn').addEventListener('click', showCalculator);
};


// Function to fetch a joke
const tellJoke = () => {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(response => response.json())
    .then(data => {
      addMessage('Kratos', data.value);
    })
    .catch(error => {
      console.error("Error fetching joke:", error);
      addMessage('Kratos', "Sorry, I couldn't fetch a joke.");
    });
};

// Function to convert units
const convertUnits = () => {
  const input = prompt("Enter value and unit (e.g., '10 meters to feet'):");
  if (input) {
    // Simple conversion logic (you can expand this)
    const [value, fromUnit, , toUnit] = input.split(' ');
    const conversionRates = {
      'meters': 3.28084, // Example conversion rate
      'feet': 0.3048,
    };

    const fromRate = conversionRates[fromUnit.toLowerCase()];
    const toRate = conversionRates[toUnit.toLowerCase()];

    if (fromRate && toRate) {
      const result = (value * fromRate / toRate).toFixed(2);
      addMessage('Kratos', `${input} is approximately ${result} ${toUnit}.`);
    } else {
      addMessage('Kratos', "Sorry, I couldn't convert that.");
    }
  }
};

// Function to show calculator
const showCalculator = () => {
  const input = prompt("Enter a math expression (e.g., '2 + 2'):");
  if (input) {
    try {
      const result = eval(input);
      addMessage('Kratos', `${input} = ${result}`);
    } catch (error) {
      addMessage('Kratos', "Invalid expression.");
    }
  }
};

// Initialize the floating icon
createFloatingIcon();
