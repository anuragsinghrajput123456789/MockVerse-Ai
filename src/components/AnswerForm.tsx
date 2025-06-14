
import React, { useState } from 'react';

interface AnswerFormProps {
  questionPaper: string;
  onSubmit: (answers: string[]) => void;
  loading: boolean;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ questionPaper, onSubmit, loading }) => {
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers.filter(answer => answer.trim() !== ''));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, '']);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
        Submit Your Answers
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {answers.map((answer, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer {index + 1}
            </label>
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
              placeholder={`Enter your answer for question ${index + 1}...`}
            />
          </div>
        ))}
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={addAnswer}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Add Another Answer
          </button>
          
          <button
            type="submit"
            disabled={loading || answers.every(a => a.trim() === '')}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Evaluating...' : 'Submit for Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerForm;
