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
    <div id="chatbot-header">Ask Kratos <span id="chatbot-close">X</span></div>
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
  style.innerHTML = `
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
      padding: 5px;
      background-color: #f5f5f5;
      border-top: 1px solid #ccc;
    }
    #chatbot-input {
      flex: 1;
      height: 40px;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 8px;
      font-size: 14px;
      color: black;
      resize: none;
      outline: none;
      background-color: #fafafa;
    }
    #chatbot-send {
      height: 40px;
      width: 60px;
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
    #performance-container {
      margin: 20px;
      display: none;
    }
    #performanceChart {
      width: 100%;
      height: 200px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #f5f5f5;
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
      addMessage('You', userMessage);
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
    document.body.style.cursor = 'move';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      botContainer.style.left = `${e.clientX - offset.x}px`;
      botContainer.style.top = `${e.clientY - offset.y}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'default';
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
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Performance tracking
let metricsData = {
  labels: [],
  responseTimes: [],
};

const updatePerformanceData = (responseTime) => {
  metricsData.labels.push(new Date().toLocaleTimeString());
  metricsData.responseTimes.push(responseTime);

  const tableBody = document.getElementById('performanceTableBody');
  const row = document.createElement('tr');
  row.innerHTML = `<td>${new Date().toLocaleTimeString()}</td><td>${responseTime} ms</td>`;
  tableBody.appendChild(row);

  updatePerformanceChart();
};

const updatePerformanceChart = () => {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  if (window.performanceChart) {
    window.performanceChart.destroy();
  }

  window.performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: metricsData.labels,
      datasets: [{
        label: 'Response Time (ms)',
        data: metricsData.responseTimes,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1,
        fill: true,
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });
};

// Function to send message to ChatGPT and receive a response
const sendMessageToChatGPT = (message) => {
  const startTime = performance.now();
  showLoadingCursor();

  chrome.runtime.sendMessage({ type: "ASK_CHATGPT", message: message }, (response) => {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    updatePerformanceData(responseTime);

    if (response && response.reply) {
      addMessage('Kratos', response.reply);
    } else {
      console.error("No valid response from background script.");
      addMessage('Kratos', "Error connecting to the server.");
    }
    restoreCursor();
  });
};

// Function to change the cursor to "loading"
const showLoadingCursor = () => {
  document.body.style.cursor = 'wait';
};

// Function to restore the cursor to default
const restoreCursor = () => {
  document.body.style.cursor = 'default';
};

// Function to show performance metrics container
const showPerformanceContainer = () => {
  const performanceContainer = document.getElementById('performance-container');
  if (performanceContainer) {
    performanceContainer.style.display = 'block';
  }
};

// Show the performance metrics container
const showPerformanceSection = () => {
  const performanceSection = document.createElement('div');
  performanceSection.id = 'performance-container';
  performanceSection.innerHTML = `
    <h3>Performance Metrics</h3>
    <canvas id="performanceChart" width="400" height="200"></canvas>
    <table id="performanceTable">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Response Time (ms)</th>
        </tr>
      </thead>
      <tbody id="performanceTableBody">
        <!-- Results will be inserted here -->
      </tbody>
    </table>
  `;
  document.body.appendChild(performanceSection);
};

// Call the functions to create the UI and show performance metrics
createChatBotUI();
showPerformanceSection();
showPerformanceContainer();
