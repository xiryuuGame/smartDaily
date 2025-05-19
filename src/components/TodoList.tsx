import React from "react";
import TodoItem from "./TodoItem";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onDeleteTodo: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onUpdate: (id: number, newText: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onDeleteTodo,
  onToggleComplete,
  onUpdate,
}) => {
  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={onDeleteTodo}
          onToggleComplete={onToggleComplete}
          onUpdate={onUpdate} // Pass the onUpdate prop down
        />
      ))}
    </ul>
  );
};

export default TodoList;
