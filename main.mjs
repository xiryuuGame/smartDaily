import { app, BrowserWindow, ipcMain } from "electron"; // Import ipcMain
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Database from "better-sqlite3"; // Import better-sqlite3

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database setup
const dbPath = path.join(app.getPath("userData"), "todos.db");
const db = new Database(dbPath);

// Create todos table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL CHECK (completed IN (0, 1)) DEFAULT 0
  );
`);

// Create settings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme TEXT,
    duration TEXT,
    priority TEXT,
    other_preferences TEXT
  );
`);

function createWindow() {
  const win = new BrowserWindow({
    width: 275,
    height: 350,
    x: 1080,
    y: 20,
    resizable: true,
    frame: false, // tidak ada title bar/menu
    transparent: false, // bisa digunakan untuk efek transparan
    alwaysOnTop:true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegrationInWorker:true,
    },
  });

  win.setMenuBarVisibility(false); // menyembunyikan menu bar default

  // Load file hasil build Vite (React) atau dev server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173'); // Load development server URL
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html")); // Load built file
  }

  ipcMain.on('minimize-app', () => {
    win.minimize();
  });

  ipcMain.on('close-app', () => {
    win.close();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // macOS: buka ulang jika ditutup jika ditutup tapi app masih jalan
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  // Di Linux & Windows, quit app jika semua window ditutup
  if (process.platform !== "darwin") {
    db.close(); // Close the database connection when the app quits
    app.quit();
  }
});

// IPC Handlers
ipcMain.on("get-todos", (event) => {
  try {
    const todos = db.prepare("SELECT * FROM todos").all();
    event.reply("todos-updated", todos); // Send todos back to renderer
  } catch (error) {
    console.error("Error getting todos:", error);
    event.reply("todos-error", error.message);
  }
});

ipcMain.on("add-todo", (event, text) => {
  try {
    const stmt = db.prepare("INSERT INTO todos (text) VALUES (?)");
    const info = stmt.run(text);
    // After adding, get the updated list and send back
    const todos = db.prepare("SELECT * FROM todos").all();
    event.reply("todos-updated", todos);
  } catch (error) {
    console.error("Error adding todo:", error);
    event.reply("todos-error", error.message);
  }
});

ipcMain.on("delete-todo", (event, id) => {
  try {
    const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
    const info = stmt.run(id);
    // After deleting, get the updated list and send back
    const todos = db.prepare("SELECT * FROM todos").all();
    event.reply("todos-updated", todos);
  } catch (error) {
    console.error("Error deleting todo:", error);
    event.reply("todos-error", error.message);
  }
});

ipcMain.on("toggle-complete", (event, id) => {
  try {
    // Get current status
    const todo = db.prepare("SELECT completed FROM todos WHERE id = ?").get(id);
    if (todo) {
      const newCompletedStatus = todo.completed === 0 ? 1 : 0;
      const stmt = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
      const info = stmt.run(newCompletedStatus, id);
      // After toggling, get the updated list and send back
      const todos = db.prepare("SELECT * FROM todos").all();
      event.reply("todos-updated", todos);
    } else {
      event.reply("todos-error", "Todo not found");
    }
  } catch (error) {
    console.error("Error toggling complete:", error);
    event.reply("todos-error", error.message);
  }
});

ipcMain.on("update-todo", (event, { id, newText }) => {
  try {
    const stmt = db.prepare("UPDATE todos SET text = ? WHERE id = ?");
    const info = stmt.run(newText, id);
    // After updating, get the updated list and send back
    const todos = db.prepare("SELECT * FROM todos").all();
    event.reply("todos-updated", todos);
  } catch (error) {
    console.error("Error updating todo:", error);
    event.reply("todos-error", error.message);
  }
});

// IPC Handlers for Settings
ipcMain.on("get-settings", (event) => {
  try {
    const settings = db.prepare("SELECT * FROM settings LIMIT 1").get();
    if (settings) {
      event.reply("settings-updated", settings);
    } else {
      // Return default settings if none exist
      event.reply("settings-updated", {
        theme: "General",
        duration: "Daily",
        priority: "Medium",
        other_preferences: "{}"
      });
    }
  } catch (error) {
    console.error("Error getting settings:", error);
    event.reply("settings-error", error.message);
  }
});

ipcMain.on("update-settings", (event, settings) => {
  try {
    // Check if settings exist
    const existingSettings = db.prepare("SELECT setting_id FROM settings LIMIT 1").get();
    if (existingSettings) {
      // Update existing settings
      const stmt = db.prepare("UPDATE settings SET theme = ?, duration = ?, priority = ?, other_preferences = ? WHERE setting_id = ?");
      stmt.run(settings.theme, settings.duration, settings.priority, settings.other_preferences, existingSettings.setting_id);
    } else {
      // Insert new settings
      const stmt = db.prepare("INSERT INTO settings (theme, duration, priority, other_preferences) VALUES (?, ?, ?, ?)");
      stmt.run(settings.theme, settings.duration, settings.priority, settings.other_preferences);
    }
    // After updating, get the updated settings and send back
    const updatedSettings = db.prepare("SELECT * FROM settings LIMIT 1").get();
    event.reply("settings-updated", updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    event.reply("settings-error", error.message);
  }
});


ipcMain.on("ai-response", async (event, prompt)=>{
  console.log("Main process received 'ai-response' event with prompt:", prompt); // Log event received
  const API_KEY = "GEMINI_API_KEY"; // Replace with your actual API key or use environment variables
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    // Fetch settings
    const settings = db.prepare("SELECT * FROM settings LIMIT 1").get() || {
      theme: "General",
      duration: "Daily",
      priority: "Medium",
      other_preferences: "{}"
    };

    // Construct personalized prompt
    const personalizedPrompt = `Generate a ${settings.duration} todo list with ${settings.priority} priority, focused on the theme "${settings.theme}". Also consider the following request: ${prompt}`;

    console.log("Attempting to fetch AI response from:", API_URL); // Log before fetch
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are a helpful assistant that generates a todo list based on the provided instructions. Respond ONLY with a JSON object containing a single key 'tasks' which is an array of strings, where each string is a todo item. Do not include any other text or formatting."
          }]
        },
        contents: [{
          parts: [{
            text: personalizedPrompt // Use the personalized prompt
          }]
        }]
      }),
    });
    console.log("Fetch response received. Status:", response.status); // Log after fetch

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API response not OK:", response.status, response.statusText, errorData); // Log API error details
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error.message}`);
    }

    const data = await response.json();
    // Assuming the response structure has the generated text (JSON string) in candidates[0].content.parts[0].text
    let generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("Raw generated text from AI:", generatedText); // Log raw text

    if (!generatedText) {
        console.error("Generated text is empty or null."); // Log if text is missing
        throw new Error("Could not generate todo list text.");
    }

    // Clean up generated text to remove potential markdown formatting
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        generatedText = generatedText.substring(jsonStart, jsonEnd + 1);
        console.log("Cleaned generated text:", generatedText); // Log cleaned text
    } else {
         // If we can't find a JSON object structure, log the raw text and error
         console.error("Could not find JSON object structure in AI response:", generatedText);
         event.reply("ai-response-error", "AI response did not contain a valid JSON object structure. Raw response: " + generatedText);
         return; // Stop processing here
    }


    // Attempt to parse the cleaned generated text as JSON
    let generatedJson;
    try {
        console.log("Attempting to parse cleaned text as JSON..."); // Log before parse
        generatedJson = JSON.parse(generatedText);
        console.log("Successfully parsed JSON:", generatedJson); // Log parsed JSON
        // Optional: Validate if the parsed JSON has the expected structure (e.g., an object with a 'tasks' array)
        if (!generatedJson || typeof generatedJson !== 'object' || !Array.isArray(generatedJson.tasks)) {
             console.error("Parsed JSON does not have expected 'tasks' array:", generatedJson); // Log validation error
             throw new Error("Parsed JSON is not a valid object with a 'tasks' array.");
        }
    } catch (parseError) {
        console.error("Error parsing generated text as JSON:", parseError); // Log parsing error
        // If JSON parsing fails, send the raw text or an error message
        event.reply("ai-response-error", "Failed to parse AI response as JSON after cleanup. Raw cleaned text: " + generatedText);
        return; // Stop processing here
    }

    // Send the parsed JSON object back to the renderer
    console.log("Sending 'ai-response-complete' event to renderer."); // Log before sending success
    event.reply("ai-response-complete", generatedJson);

  } catch (error) {
    console.error("Error calling Gemini API or processing response:", error); // Log any catch-all errors
    console.log("Sending 'ai-response-error' event to renderer."); // Log before sending error
    event.reply("ai-response-error", error.message);
  }
})
