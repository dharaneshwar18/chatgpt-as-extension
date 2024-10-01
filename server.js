import dotenv from "dotenv-safe";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatGPTAPI } from "chatgpt";
import { oraPromise } from "ora";
import config from './config.js'; // Ensure this matches the export in config.js

// Initialize Express app with middleware
const app = express().use(cors()).use(bodyParser.json());

// Initialize ChatGPT API
const gptApi = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo' // or gpt-4 for better context handling
});

// Configuration for plugins and rules
const Config = configure(config);

// Conversation class to track the conversation and parent message IDs
class Conversation {
    constructor() {
        this.conversationID = null;
        this.parentMessageID = null;
        this.conversationHistory = []; // Store conversation history as an array of messages
    }

    // Send message to ChatGPT
    async sendMessage(msg) {
        // Concatenate the conversation history for context
        const context = this.conversationHistory.map((entry) => `${entry.sender}: ${entry.message}`).join('\n');
        const prompt = context ? `${context}\nUser: ${msg}` : msg;

        let res;
        try {
            // Send the message to the ChatGPT API
            res = await gptApi.sendMessage(prompt, {
                conversationId: this.conversationID,
                parentMessageId: this.parentMessageID,
            });
        } catch (apiError) {
            console.log("Error calling ChatGPT API:", apiError); // Log API errors
            throw new Error("Failed to fetch reply from API");
        }

        // Log the entire API response to check its structure
        console.log("API Response:", JSON.stringify(res, null, 2)); // Pretty print the response for clarity

        let replyMessage;

        // Check the response structure to get the reply
        if (res.text) {
            replyMessage = res.text; // Extract the reply message
        } else {
            console.log("Unexpected API response format:", res); // Log unexpected format
            throw new Error("Reply message is undefined"); // Handle case where reply is empty
        }

        // Update conversation and parent message IDs
        if (res.conversationId) {
            this.conversationID = res.conversationId;
        }
        if (res.parentMessageId) {
            this.parentMessageID = res.parentMessageId;
        }

        // Add user message and bot response to the conversation history
        this.conversationHistory.push({ sender: 'user', message: msg });
        this.conversationHistory.push({ sender: 'bot', message: replyMessage });

        // Return bot's response
        return replyMessage;
    }

    // Reset conversation (optional if you want to clear history)
    reset() {
        this.conversationID = null;
        this.parentMessageID = null;
        this.conversationHistory = [];
    }
}

const conversation = new Conversation();

// Define API route to handle incoming user requests
app.post("/", async (req, res) => {
    try {
        const { message, reset } = req.body;

        // Reset the conversation history if the user sends a "reset" command
        if (reset) {
            conversation.reset();
        }

        console.log("Received message:", message); // Log the received message

        // Send message to ChatGPT and get the reply
        const rawReply = await oraPromise(conversation.sendMessage(message), {
            text: message,
        });

        // Log the raw reply from the API
        console.log("Raw reply from ChatGPT:", rawReply);

        // Apply any parsing rules and send the response back to the client
        const reply = await Config.parse(rawReply);

        // Log the final reply to send back
        console.log("Generated reply:", reply);

        if (!reply) {
            throw new Error("Reply is undefined or empty."); // Additional check
        }

        console.log(`----------\n${reply}\n----------`);
        res.json({ reply });
    } catch (error) {
        console.log("Error in processing request:", error); // Log the error
        console.log("Error details:", error.message); // Log just the message for more clarity
        res.status(500).send("Server Error");
    }
});

// Function to start the server
async function start() {
    await oraPromise(Config.train(), {
        text: `Training ChatGPT (${Config.rules.length} plugin rules)`,
    });
    await oraPromise(
        new Promise((resolve) => app.listen(3000, () => resolve())),
        {
            text: "You may now use the extension",
        }
    );
}

// Function to configure plugins and conversation rules
function configure({ plugins, ...opts }) {
    let rules = [];
    let parsers = [];

    // Collect rules and parsers from all plugins
    for (const plugin of plugins) {
        if (plugin.rules) {
            rules = rules.concat(plugin.rules);
        }
        if (plugin.parse) {
            parsers.push(plugin.parse);
        }
    }

    // Send ChatGPT a training message that includes all plugin rules
    const train = () => {
        if (!rules.length) return;

        const message = `Rules:
    ${rules.map((rule) => `- ${rule}`).join('\n')}`; // Correctly use backticks
        return conversation.sendMessage(message);
    };

    // Run the ChatGPT response through all plugin parsers
    const parse = async (reply) => {
        for (const parser of parsers) {
            reply = await parser(reply);
        }
        return reply;
    };

    return { train, parse, rules, ...opts };
}

// Start the server
start();
