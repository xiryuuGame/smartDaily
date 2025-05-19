import { contextBridge, ipcRenderer } from "electron";

// Expose only safe APIs
contextBridge.exposeInMainWorld("electronAPI", {
  // Contoh: panggil fungsi ke main
  sendMessage: (msg) => ipcRenderer.send("message", msg),
  onMessage: (callback) => {
    // Add validation here
    if (typeof callback !== 'function') {
      console.error("electronAPI.onMessage requires a function callback.");
      // Optionally, return a no-op unsubscribe function or throw an error
      return () => {}; // Return a dummy unsubscribe
    }
    const handler = (_event, value) => callback(value);
    ipcRenderer.on("reply", handler);
    return () => ipcRenderer.removeListener("reply", handler); // Return unsubscribe
  },

  // New Todo APIs
  getTodos: () => ipcRenderer.send("get-todos"),
  addTodo: (text) => ipcRenderer.send("add-todo", text),
  deleteTodo: (id) => ipcRenderer.send("delete-todo", id),
  toggleComplete: (id) => ipcRenderer.send("toggle-complete", id),
  updateTodo: (id, newText) => ipcRenderer.send("update-todo", { id, newText }),

  onTodosUpdated: (callback) => {
    ipcRenderer.on("todos-updated", (_event, todos) => callback(todos));
    return () => ipcRenderer.removeListener("todos-updated", callback); // Return unsubscribe
  },
  onTodosError: (callback) => {
    ipcRenderer.on("todos-error", (_event, error) => callback(error));
    return () => ipcRenderer.removeListener("todos-error", callback); // Return unsubscribe
  },

  // AI Response APIs
  sendAiPrompt: (prompt) => {
    console.log("Sending AI prompt:", prompt);
    ipcRenderer.send("ai-response", prompt);
  },
  onAiResponseComplete: (callback) => {
    const handler = (_event, responseJson) => {
      console.log("AI response received:", responseJson);
      callback(responseJson);
    };
    ipcRenderer.on("ai-response-complete", handler);
    return () => ipcRenderer.removeListener("ai-response-complete", handler); // Return unsubscribe
  },
  onAiResponseError: (callback) => {
    const handler = (_event, error) => {
      console.error("AI response error:", error);
      callback(error);
    };
    ipcRenderer.on("ai-response-error", handler);
    return () => ipcRenderer.removeListener("ai-response-error", handler); // Return unsubscribe
  },
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),

  // Settings APIs
  getSettings: () => ipcRenderer.send("get-settings"),
  updateSettings: (settings) => ipcRenderer.send("update-settings", settings),

  onSettingsUpdated: (callback) => {
    ipcRenderer.on("settings-updated", (_event, settings) => callback(settings));
    return () => ipcRenderer.removeListener("settings-updated", callback); // Return unsubscribe
  },
  onSettingsError: (callback) => {
    ipcRenderer.on("settings-error", (_event, error) => callback(error));
    return () => ipcRenderer.removeListener("settings-error", callback); // Return unsubscribe
  },
});
