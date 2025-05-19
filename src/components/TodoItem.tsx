import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onUpdate: (id: number, newText: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete, onToggleComplete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedText(todo.text); // Initialize editedText with current todo text
  };

  const handleSaveClick = () => {
    if (editedText.trim()) {
      onUpdate(todo.id, editedText);
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedText(todo.text); // Revert to original text
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    } else if (e.key === 'Escape') {
      handleCancelClick();
    }
  };


  const handleItemClick = (e: React.MouseEvent) => {
    // Prevent toggling completion when clicking on the checkbox, edit button, or delete button
    if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      onToggleComplete(todo.id);
    }
  };

  return (
    <li className={`flex items-center justify-between p-3 rounded-md shadow-sm transition-colors duration-200 ${isEditing ? '' : 'cursor-pointer'} ${todo.completed ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
        onClick={handleItemClick}
    >
      <div className="flex items-center flex-grow">
        <input
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id)}
          className="mr-3 h-5 w-5 text-blue-700 focus:ring-blue-600 border-gray-300 rounded"
        />
        {isEditing ? (
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCancelClick}
            className="flex-grow p-1 border rounded focus:outline-none focus:border-blue-400 text-gray-800"
            autoFocus
          />
        ) : (
          <span className={`flex-grow text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
            {todo.text}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2 ml-4">
        {isEditing ? (
          <>
            <button
              onMouseDown={handleSaveClick} // Use onMouseDown to prevent onBlur from firing
              className="p-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm"
            >
              Save
            </button>
            <button
              onMouseDown={handleCancelClick} // Use onMouseDown to prevent onBlur from firing
              className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEditClick}
              className="p-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors duration-200 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors duration-200 text-sm"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
};

export default TodoItem;
