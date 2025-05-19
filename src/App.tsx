import { useState, useRef, useEffect, useCallback } from "react";
import AddTodoForm from "./components/AddTodoForm";
import TodoList from "./components/TodoList";
import AiGenForm from "./components/AIGenForm";
import SettingsForm from "./components/SettingsForm"; // Import SettingsForm

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Declare electronAPI on the window object
declare global {
  interface Window {
    electronAPI: {
      getTodos: () => void;
      addTodo: (text: string) => void;
      deleteTodo: (id: number) => void;
      toggleComplete: (id: number) => void;
      sendAiPrompt: (prompt: string) => void;
      updateTodo: (id: number, newText: string) => void;
      onTodosUpdated: (callback: (todos: Todo[]) => void) => () => void;
      onTodosError: (callback: (error: string) => void) => () => void;
      minimizeApp: () => void;
      closeApp: () => void;
      onAiResponseComplete: (callback:any)=>void;
      // Settings APIs
      getSettings: () => void;
      updateSettings: (settings: any) => void; // Use any for now, can refine later
      onSettingsUpdated: (callback: (settings: any) => void) => () => void; // Use any for now
      onSettingsError: (callback: (error: string) => void) => () => void;
    };
  }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [statusNow, setStatusNow] = useState("non-active"); // 'non-active', 'active', 'settings'
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const todoListContainerRef = useRef<HTMLDivElement>(null);

  const toggleSettings = () => {
    setStatusNow(statusNow === "settings" ? "non-active" : "settings");
  };

  // Fetch todos on component mount and subscribe to updates
  useEffect(() => {
    window.electronAPI.getTodos(); // Request initial todos

    const unsubscribeUpdated = window.electronAPI.onTodosUpdated((updatedTodos) => {
      setTodos(updatedTodos);
    });

    const unsubscribeError = window.electronAPI.onTodosError((error) => {
      console.error("Error from main process:", error);
      // Handle error, e.g., show a message to the user
    });

    return () => {
      unsubscribeUpdated();
      unsubscribeError();
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const addTodo = (text: string) => {
    window.electronAPI.addTodo(text);
  };

  const deleteTodo = (id: number) => {
    window.electronAPI.deleteTodo(id);
  };

  const toggleComplete = (id: number) => {
    window.electronAPI.toggleComplete(id);
  };

  const updateTodo = (id: number, newText: string) => {
    window.electronAPI.updateTodo(id, newText);
  };

  const aiStatus = (status: string) => {
    if (status == "active") {
      setStatusNow("non-active");
      console.log(statusNow);
    } else {
      setStatusNow("active");
      console.log(statusNow);
    }
  };

const AISubmit = (text: string) => {
  window.electronAPI.sendAiPrompt(text);

  const unsubscribe = window.electronAPI.onAiResponseComplete((response: any) => {
    console.log("AI Response:", response);
    // Proses result menjadi sesuatu
    // Misalnya, tambahkan ke daftar todos:
    if (response && response.tasks && Array.isArray(response.tasks)) {
      response.tasks.forEach((taskText: string) => {
        addTodo(taskText); // Asumsikan addTodo sudah didefinisikan
      });
    }

    setStatusNow("non-active"); // Hanya set status setelah menerima dan memproses respon
    // @ts-ignore
    unsubscribe(); // Hapus listener setelah diproses
  });
};

  const handleScroll = useCallback(() => {
    if (todoListContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = todoListContainerRef.current;
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 5; // Add a small buffer
      setShowScrollIndicator(!isScrolledToBottom);
    }
  }, [todoListContainerRef.current]); // Dependency array for useCallback

  useEffect(() => {
    const container = todoListContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);

      // Initial check for scrollability and indicator visibility
      const isScrollable = container.scrollHeight > container.clientHeight;
      const isScrolledToBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 5; // Add a small buffer
      setShowScrollIndicator(isScrollable && !isScrolledToBottom);

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [todoListContainerRef.current, handleScroll, todos.length]); // Add todos.length to re-evaluate visibility when todos change

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="top-0 bg-gray-300 w-full absolute h-11 flex justify-end items-center">
        <button
          id="minimize-button"
          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-400 mr-1 text-xl font-bold border border-gray-400 rounded-md shadow-sm"
          onClick={() => window.electronAPI.minimizeApp()}
        >
          _
        </button>
        <button
          id="exit-button"
          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-red-500 text-xl font-bold border border-gray-400 rounded-md shadow-sm"
          onClick={() => window.electronAPI.closeApp()}
        >
          X
        </button>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[100vh]">
        {statusNow === "settings" ? (
          <SettingsForm onBack={() => setStatusNow("non-active")} />
        ) : statusNow === "active" ? (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">AI-Todo Gen</h1>
            <AiGenForm onAIGen={AISubmit} />

            <button
              onClick={() => aiStatus(statusNow)}
              className="ml-auto float-right font-bold text-blue-400 underline hover:text-green-800"
            >
              back to the todo
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Todo List</h1>
            <AddTodoForm onAddTodo={addTodo} />
            <div
              className="max-h-64 overflow-y-auto todo-container scroll-indicator-container"
              ref={todoListContainerRef}
            >
              <TodoList
                todos={todos}
                onDeleteTodo={deleteTodo}
                onToggleComplete={toggleComplete}
                onUpdate={updateTodo}
              />
              {/* Scroll Indicator */}
              <div className={`scroll-indicator ${showScrollIndicator ? "" : "hidden"}`}></div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={toggleSettings}
                className="font-bold text-blue-400 underline hover:text-green-800"
              >
                Settings
              </button>
              <button
                onClick={() => aiStatus(statusNow)}
                className="font-bold text-blue-400 underline hover:text-green-800"
              >
                Use AI to generate the todo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
