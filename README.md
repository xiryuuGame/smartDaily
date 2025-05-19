# SmartDaily Todo App (with AI Generation)

## Description

SmartDaily is a simple Electron-based Todo application with integrated AI capabilities for generating todo lists based on user preferences and prompts. It utilizes `better-sqlite3` for local data storage and a React frontend built with Vite. The application features a clean interface, options for managing todos (add, delete, toggle complete, update), and a settings panel to customize AI generation parameters like theme, duration, and priority.

## Features

*   **Todo Management:** Add, delete, toggle completion status, and update existing todo items.
*   **AI Todo Generation:** Generate todo lists using a prompt and customizable settings (theme, duration, priority).
*   **Local Storage:** Stores todos and settings locally using `better-sqlite3`.
*   **Customizable Settings:** Configure AI generation parameters through a dedicated settings panel.
*   **Electron Framework:** Provides a cross-platform desktop application experience.
*   **React Frontend:** Built with React and Vite for a responsive user interface.
*   **Frameless Window:** A compact, always-on-top window design.

## Technologies Used

*   Electron
*   React
*   Vite
*   Tailwind CSS
*   better-sqlite3
*   Google Gemini API (for AI generation)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd smartdaily
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Gemini API Key:**
    *   Obtain an API key from the Google AI for Developers website.
    *   Replace `"GEMINI_API_KEY"` in `main.mjs` with your actual API key. **Note:** For production, consider using environment variables or a more secure method to handle your API key.

## Usage

1.  **Start the application:**
    *   **Development Mode:**
        ```bash
        npm run dev
        ```
    *   **Production Build:**
        ```bash
        npm run build
        npm start
        ```
2.  **Managing Todos:**
    *   Use the input field to add new todos.
    *   Click on a todo item to toggle its completion status.
    *   Click the "Edit" button to modify a todo's text.
    *   Click the "Delete" button to remove a todo.
3.  **Using AI to Generate Todos:**
    *   Click the "Use AI to generate the todo" button.
    *   Enter a prompt in the AI generation form.
    *   Click "Submit" to generate a todo list based on your prompt and settings.
4.  **Configuring AI Settings:**
    *   Click the "Settings" button.
    *   Adjust the Theme, Duration, and Priority for AI-generated todos.
    *   Click "Save Settings" to apply your changes.

## File Structure

```
.
├── .gitignore
├── eslint.config.js
├── index.html
├── main.mjs           # Electron main process
├── package-lock.json
├── package.json
├── preload.mjs        # Electron preload script
├── README.md          # This file
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx        # Main React component
    ├── main.css       # Tailwind CSS and custom styles
    ├── main.tsx       # React entry point
    ├── vite-env.d.ts
    └── components/    # React components
        ├── AIGenForm.tsx
        ├── AddTodoForm.tsx
        ├── SettingsForm.tsx
        ├── TodoItem.tsx
        └── TodoList.tsx
