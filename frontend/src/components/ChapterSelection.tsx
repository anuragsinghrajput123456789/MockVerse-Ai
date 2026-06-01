
import React from 'react';

interface ChapterSelectionProps {
  defaultChapters: string[];
  customChapters: string[];
  selectedChapters: string[];
  onChapterToggle: (chapter: string) => void;
  onRemoveCustomChapter: (chapter: string) => void;
  onAddCustomChapter: () => void;
  newChapter: string;
  setNewChapter: (value: string) => void;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({
  defaultChapters,
  customChapters,
  selectedChapters,
  onChapterToggle,
  onRemoveCustomChapter,
  onAddCustomChapter,
  newChapter,
  setNewChapter,
}) => {
  return (
    <>
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
                onAddCustomChapter();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddCustomChapter}
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
          {defaultChapters.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Default Chapters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultChapters.map((chapter) => (
                  <div key={chapter} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter)}
                        onChange={() => onChapterToggle(chapter)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{chapter}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customChapters.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Custom Chapters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {customChapters.map((chapter) => (
                  <div key={chapter} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter)}
                        onChange={() => onChapterToggle(chapter)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{chapter}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomChapter(chapter)}
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
    </>
  );
};

export default ChapterSelection;

