
import React from 'react';
import { Resource } from '../types';

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'Course': return '🎓';
      case 'Book': return '📚';
      case 'Blog': return '📝';
      case 'Video': return '🎥';
      case 'PDF': return '📄';
      default: return '📎';
    }
  };

  const getTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'Course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Book': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Blog': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PDF': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (resources.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
          Learning Resources
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No resources added yet. Add some learning resources to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
        Learning Resources ({resources.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{resource.title}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                {resource.type}
              </span>
            </div>
            
            {resource.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{resource.description}</p>
            )}
            
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
            >
              Visit Resource →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
