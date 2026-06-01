
import React from 'react';
import { Resource } from '../../types';
import ResourceForm from '../ResourceForm';
import ResourceList from '../ResourceList';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../hooks/use-toast';

const ResourcesTab: React.FC = () => {
  const [resources, setResources] = useLocalStorage<Resource[]>('resources', []);
  const { toast } = useToast();

  const handleAddResource = (resourceData: Omit<Resource, 'id' | 'createdAt'>) => {
    const resource: Resource = {
      id: Date.now().toString(),
      ...resourceData,
      createdAt: new Date()
    };
    
    setResources(prev => [resource, ...prev]);
    
    toast({
      title: "Resource Added!",
      description: "Learning resource has been added successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <ResourceForm onAdd={handleAddResource} />
      <ResourceList resources={resources} />
    </div>
  );
};

export default ResourcesTab;
