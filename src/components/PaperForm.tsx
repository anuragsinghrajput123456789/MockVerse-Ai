import React, { useState } from 'react';
import { PaperFormData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaperFormProps {
  onSubmit: (data: PaperFormData) => void;
  loading: boolean;
}

const PaperForm: React.FC<PaperFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<PaperFormData>({
    subject: '',
    class: '',
    totalMarks: 100,
    difficulty: 'Medium',
    board: '',
    chapters: [],
    topics: '',
    instructions: '',
    pattern: ''
  });

  const [defaultChapters] = useState([
    'Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics',
    'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
    'English Literature', 'Grammar', 'Economics', 'Political Science'
  ]);

  const [customChapters, setCustomChapters] = useLocalStorage<string[]>('customChapters', []);
  const [newChapter, setNewChapter] = useState('');

  const availableChapters = [...defaultChapters, ...customChapters];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.class && formData.board && formData.chapters.length > 0) {
      onSubmit(formData);
    }
  };

  const handleChapterToggle = (chapter: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.includes(chapter)
        ? prev.chapters.filter(c => c !== chapter)
        : [...prev.chapters, chapter]
    }));
  };

  const handleAddCustomChapter = () => {
    if (newChapter.trim() && !defaultChapters.includes(newChapter.trim()) && !customChapters.includes(newChapter.trim())) {
      setCustomChapters(prev => [...prev, newChapter.trim()]);
      setNewChapter('');
    }
  };

  const handleRemoveCustomChapter = (chapter: string) => {
    setCustomChapters(prev => prev.filter(c => c !== chapter));
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c !== chapter)
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent mb-6">
        Generate Question Paper
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Mathematics"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class *
            </label>
            <Select
              value={formData.class}
              onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`}>{i + 1}th</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Marks
            </label>
            <input
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Average">Average</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board/Book Type *
            </label>
            <Select
              value={formData.board}
              onValueChange={(value) => setFormData(prev => ({ ...prev, board: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NCERT">NCERT</SelectItem>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="State Board">State Board</SelectItem>
                <SelectItem value="IB">IB</SelectItem>
                <SelectItem value="Cambridge">Cambridge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Pattern
            </label>
            <Select
              value={formData.pattern}
              onValueChange={(value) => setFormData(prev => ({ ...prev, pattern: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Board-style">Board-style</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
                <SelectItem value="MCQ">MCQ</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Custom Chapter
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter chapter name"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomChapter();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomChapter}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chapters * (Select multiple)
          </label>
          <div className="space-y-4 max-h-60 overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Default Chapters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultChapters.map((chapter) => (
                  <div key={chapter} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={formData.chapters.includes(chapter)}
                        onChange={() => handleChapterToggle(chapter)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{chapter}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {customChapters.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Custom Chapters</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {customChapters.map((chapter) => (
                    <div key={chapter} className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={formData.chapters.includes(chapter)}
                          onChange={() => handleChapterToggle(chapter)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{chapter}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomChapter(chapter)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Remove custom chapter"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specific Topics (Optional)
          </label>
          <input
            type="text"
            value={formData.topics}
            onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Quadratic equations, Probability"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
            placeholder="Any specific requirements or instructions..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Question Paper'}
        </button>
      </form>
    </div>
  );
};

export default PaperForm;
