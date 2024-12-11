# ChatGPT Chrome Extension

A powerful and interactive Chrome Extension that integrates OpenAI's GPT-3.5 to provide a seamless conversational experience directly in your browser. This project features a floating UI with a sleek design and smooth animations, offering an intuitive chat interface for enhanced user interactions.

---

## 🚀 Features

- **Floating UI**: Minimalistic and elegant UI with a violet-themed background and cool animations for an engaging user experience.
- **Interactive Bot**: Chat with an intelligent bot powered by GPT-3.5.
- **Right-Click Text Query**: Highlight any text or word on a webpage, right-click, and select "Ask ChatGPT" from the context menu to open the floating UI and get instant insights.
- **Efficient Backend**: Node.js-powered backend that handles API requests to OpenAI's GPT-3.5 model.
- **Easy Accessibility**: The extension is accessible directly from your Chrome toolbar for instant use.

---

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS (with animations), JavaScript.
- **Backend**: Node.js with Express for API integration.
- **API**: OpenAI's GPT-3.5.

---

## 📦 Installation

### Clone the Repository:
```bash
git clone https://github.com/dharaneshwar18/chatgpt-chrome-extension.git
cd chatgpt-chrome-extension
```

### Install Dependencies:
```bash
npm install
```

### Configure OpenAI API Key:
1. Rename `.env.example` to `.env`.
2. Add your OpenAI API key:
   ```makefile
   OPENAI_API_KEY=your_api_key_here
   ```

### Build the Extension:
```bash
npm run build
```

### Load the Extension in Chrome:
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer Mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `dist` folder.

### Start the Backend Server:
```bash
npm start
```

---

## 🚀 Usage

1. Click on the ChatGPT icon in the Chrome toolbar.
2. Use the floating UI to chat with the bot.

### Right-Click Query:
1. Highlight any text or word on a webpage.
2. Right-click and select **Ask ChatGPT** from the context menu.
3. The floating UI will pop up with the query, and the bot will respond instantly.

Enjoy smooth animations and instant responses powered by GPT-3.5.

---

## 🛡️ Security

Ensure you keep your API key secure by not exposing it in public repositories. Use environment variables to store sensitive data.


---

## 📧 Contact

For further inquiries or support, contact:

**Dharaneshwar**  
Email: dharaneshwarb@gmail.com
