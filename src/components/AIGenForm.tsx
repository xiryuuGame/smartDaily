import React, { useState } from 'react';

interface AIGenFormProps {
  onAIGen: (text: string) => void;
}

const AiGenForm: React.FC<AIGenFormProps> = ({ onAIGen }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAIGen(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex mb-6 border border-gray-300 rounded-lg overflow-hidden">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add ideas for AI generating"
        className="flex-grow p-3 text-gray-700 focus:outline-none focus:border-blue-400"
      />
      <button type="submit" className="bg-gray-700 text-white p-3 hover:bg-gray-800 transition-colors duration-200">
        Submit
      </button>
    </form>
  );
};

export default AiGenForm;
