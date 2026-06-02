import React, { useState, useEffect } from 'react';
import { Resource } from '../../types';
import ResourceForm from '../ResourceForm';
import ResourceList from '../ResourceList';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../hooks/use-toast';
import { Share2, BookMarked, Download, Sparkles, X, Link } from "lucide-react";

const ResourcesTab: React.FC = () => {
  const [resources, setResources] = useLocalStorage<Resource[]>('resources', []);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [sharedImport, setSharedImport] = useState<Omit<Resource, 'id' | 'createdAt'> | null>(null);
  const { toast } = useToast();

  // Check URL parameters for shareable resource tokens on mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sharedToken = queryParams.get('share_resource');
    
    if (sharedToken) {
      try {
        // Decode Base64 string back to resource JSON
        const decodedString = atob(sharedToken);
        const parsedResource = JSON.parse(decodedString);
        
        if (parsedResource && parsedResource.title && parsedResource.link) {
          setSharedImport({
            title: parsedResource.title,
            type: parsedResource.type || 'Course',
            link: parsedResource.link,
            description: parsedResource.description || ''
          });
        }
      } catch (error) {
        console.error('Failed to parse shared resource token:', error);
      }
    }
  }, []);

  // CRUD: Add Resource
  const handleAddResource = (resourceData: Omit<Resource, 'id' | 'createdAt'>) => {
    const newResource: Resource = {
      id: Date.now().toString(),
      ...resourceData,
      createdAt: new Date()
    };
    
    setResources(prev => [newResource, ...prev]);
    
    toast({
      title: "Resource Added!",
      description: "Learning resource has been added successfully.",
    });
  };

  // CRUD: Delete Resource
  const handleDeleteResource = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
    
    // If the currently edited resource is deleted, cancel editing mode
    if (editingResource && editingResource.id === resourceId) {
      setEditingResource(null);
    }

    toast({
      title: "Resource Removed",
      description: "Learning resource has been removed from library.",
    });
  };

  // CRUD: Enter Edit Mode
  const handleEditSelect = (resource: Resource) => {
    setEditingResource(resource);
    // Smooth scroll to top of resources tab so user sees edit form pre-filled
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD: Update Resource
  const handleUpdateResource = (id: string, updatedData: Omit<Resource, 'id' | 'createdAt'>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updatedData } : r));
    setEditingResource(null);

    toast({
      title: "Resource Updated!",
      description: "Learning resource changes saved successfully.",
    });
  };

  // Share link copy (Base64 URL)
  const handleShareResource = (resource: Resource) => {
    try {
      const sharePayload = {
        title: resource.title,
        type: resource.type,
        link: resource.link,
        description: resource.description
      };
      
      const base64String = btoa(JSON.stringify(sharePayload));
      const shareableLink = `${window.location.origin}/?share_resource=${base64String}`;
      
      navigator.clipboard.writeText(shareableLink);
      
      toast({
        title: "Link Copied!",
        description: "Sharable Base64 resource URL copied to clipboard.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Clipboard Error",
        description: "Failed to write share URL. Copy the resource link manually.",
        variant: "destructive"
      });
    }
  };

  // Stand-alone HTML File Generator with clickable links
  const handleExportResource = (resource: Resource) => {
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MockVerse Shared Resource: ${resource.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0B0F19; color: #f1f5f9; }
    .glass-card { background: rgba(15, 22, 42, 0.5); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4); }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
  <!-- Glowing vector overlays -->
  <div class="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>

  <div class="glass-card max-w-lg w-full p-8 rounded-3xl text-center space-y-6 relative z-10">
    <div class="w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold mx-auto shadow-lg shadow-indigo-500/20">
      MV
    </div>

    <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
      <span>Shared ${resource.type} Material</span>
    </div>

    <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Sora']">${resource.title}</h1>

    ${resource.description ? `<p class="text-slate-400 text-sm leading-relaxed">${resource.description}</p>` : ''}

    <div class="pt-4 flex flex-col gap-3">
      <!-- Clickable link to syllabus source -->
      <a 
        href="${resource.link}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] text-sm block"
      >
        Open Clickable Link &rarr;
      </a>
      
      <a 
        href="${window.location.origin}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
      >
        Created via MockVerse(AI)
      </a>
    </div>
  </div>
</body>
</html>`;

      // Download trigger
      const element = document.createElement("a");
      const file = new Blob([htmlContent], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `${resource.title.trim().replace(/\s+/g, '-').toLowerCase()}-shareable.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast({
        title: "Export Success!",
        description: "Interactive clickable HTML file downloaded successfully.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Export Failure",
        description: "Failed to assemble HTML file.",
        variant: "destructive"
      });
    }
  };

  // Complete shared resource imports
  const handleImportShared = () => {
    if (!sharedImport) return;

    const newResource: Resource = {
      id: Date.now().toString(),
      title: sharedImport.title,
      type: sharedImport.type,
      link: sharedImport.link,
      description: sharedImport.description,
      createdAt: new Date()
    };

    setResources(prev => [newResource, ...prev]);
    setSharedImport(null);

    // Clear query parameter in browser URL address bar
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newurl }, '', newurl);

    toast({
      title: "Import Success!",
      description: `"${newResource.title}" added to your study library!`,
    });
  };

  const handleDismissImport = () => {
    setSharedImport(null);
    // Clear query parameter in browser URL address bar
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newurl }, '', newurl);
  };

  return (
    <div className="space-y-8 relative">
      {/* Import shared item popup modal overlay */}
      {sharedImport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl relative border border-white/10 text-center space-y-6">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleDismissImport}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold mx-auto shadow-lg">
              MV
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Received shared resource</span>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white leading-tight">{sharedImport.title}</h3>
              <span className="text-[10px] text-indigo-400 font-bold uppercase block mt-1.5">{sharedImport.type}</span>
              
              {sharedImport.description && (
                <p className="text-slate-400 text-xs leading-relaxed mt-4 bg-white/5 p-4 rounded-xl border border-white/5 text-justify">
                  {sharedImport.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a 
                href={sharedImport.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Visit Source</span>
              </a>
              <button 
                onClick={handleImportShared}
                className="flex-grow flex-1 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/10"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import to Library</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ResourceForm 
        onAdd={handleAddResource} 
        onUpdate={handleUpdateResource}
        editingResource={editingResource}
        onCancelEdit={() => setEditingResource(null)}
      />
      
      <ResourceList 
        resources={resources} 
        onDelete={handleDeleteResource}
        onEdit={handleEditSelect}
        onShare={handleShareResource}
        onExport={handleExportResource}
      />
    </div>
  );
};

export default ResourcesTab;
