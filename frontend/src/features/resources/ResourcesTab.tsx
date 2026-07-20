import React from 'react';
import { Folder, Bookmark, Layers, Sparkles, Plus } from 'lucide-react';
import ResourceForm from './ResourceForm';
import ResourceList from './ResourceList';
import Auth from '../auth/Auth';
import { useResourcesState } from './resources/useResourcesState';
import SheetSelector from './resources/SheetSelector';
import CollectionHeader from './resources/CollectionHeader';
import ResourceFilters from './resources/ResourceFilters';
import EmptyState from './resources/EmptyState';
import CreateSheetModal from './resources/modals/CreateSheetModal';
import SettingsModal from './resources/modals/SettingsModal';
import ShareModal from './resources/modals/ShareModal';
import QrModal from './resources/modals/QrModal';

const SkeletonCard: React.FC = () => (
  <div className="p-5 border border-white/5 rounded-2xl bg-white/5 animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-24 h-6 bg-white/10 rounded-lg" />
      <div className="w-16 h-5 bg-white/10 rounded-full" />
    </div>
    <div className="w-2/3 h-5 bg-white/10 rounded" />
    <div className="w-full h-12 bg-white/10 rounded" />
    <div className="flex items-center space-x-2">
      <div className="w-12 h-4 bg-white/10 rounded" />
      <div className="w-12 h-4 bg-white/10 rounded" />
    </div>
  </div>
);

const ResourcesTab: React.FC = () => {
  const {
    user,
    sheets,
    activeSheet,
    loadingSheets,
    loadingResources,
    isSharedView,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterDifficulty,
    setFilterDifficulty,
    filterSubject,
    setFilterSubject,
    filterChapter,
    setFilterChapter,
    sortBy,
    setSortBy,
    editingResource,
    setEditingResource,
    showResourceForm,
    setShowResourceForm,
    showCreateModal,
    setShowCreateModal,
    newSheetName,
    setNewSheetName,
    newSheetDesc,
    setNewSheetDesc,
    newSheetSubject,
    setNewSheetSubject,
    newSheetChapter,
    setNewSheetChapter,
    newSheetPublic,
    setNewSheetPublic,
    showSettingsModal,
    setShowSettingsModal,
    editingSheet,
    setEditingSheet,
    showShareModal,
    setShowShareModal,
    showQrModal,
    setShowQrModal,
    fetchSheets,
    fetchSheetDetails,
    handleCreateSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    handleDuplicateSheet,
    handleAddResource,
    handleUpdateResource,
    handleDeleteResource,
    handleToggleFavorite,
    handleToggleCompleted,
    getShareLink,
    handleCopyShareLink,
    handleExportPdf,
    handleExportHtml,
    handlePrintSheet,
    processedResources,
    uniqueTypes,
    uniqueSubjects,
    uniqueChapters,
    qrCodeUrl,
    handleEditSelect,
    setIsSharedView,
    setSharedSheetId
  } = useResourcesState();

  // Loading spinner for sheets
  if (loadingSheets) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Folder className="w-10 h-10 text-indigo-400 animate-pulse" />
        <p className="text-slate-400 text-sm">Loading your Study Resource Library...</p>
      </div>
    );
  }

  // Not logged in empty/auth state (unless shared view)
  if (!user && !isSharedView) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 text-center space-y-6">
          <Bookmark className="w-12 h-12 text-indigo-500 mx-auto opacity-75 animate-bounce" />
          <div>
            <h3 className="text-2xl font-bold text-white font-['Sora']">Start building your Study Resource Library</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
              Sign in or create a secure account to organize your files, study links, and notes before generating your AI exams.
            </p>
          </div>
        </div>
        <Auth isInline={true} />
      </div>
    );
  }

  // Logged in but has NO sheets -> Empty State
  if (sheets.length === 0 && !isSharedView) {
    return (
      <div className="glass-card p-10 md:p-16 rounded-3xl border border-white/5 text-center space-y-6 max-w-2xl mx-auto my-12 animate-fade-in">
        <Layers className="w-16 h-16 text-indigo-500/80 mx-auto animate-pulse" />
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white font-['Sora']">Start building your Study Resource Library</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Create resource sheets to group your textbook chapters, study guides, and playlists in one secure workspace.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition mx-auto shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Sheet</span>
        </button>

        <CreateSheetModal
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          newSheetName={newSheetName}
          setNewSheetName={setNewSheetName}
          newSheetDesc={newSheetDesc}
          setNewSheetDesc={setNewSheetDesc}
          newSheetSubject={newSheetSubject}
          setNewSheetSubject={setNewSheetSubject}
          newSheetChapter={newSheetChapter}
          setNewSheetChapter={setNewSheetChapter}
          newSheetPublic={newSheetPublic}
          setNewSheetPublic={setNewSheetPublic}
          handleCreateSheet={handleCreateSheet}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative animate-fade-in">
      {/* ─── Shared View Top Banner ─── */}
      {isSharedView && (
        <div className="no-print p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Viewing shared study collection in <strong>Read-Only Mode</strong>.</span>
          </div>
          {user ? (
            <button 
              onClick={() => {
                setIsSharedView(false);
                setSharedSheetId(null);
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.pushState({ path: cleanUrl }, '', cleanUrl);
                fetchSheets();
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs tracking-wide transition shadow"
            >
              Back to My Sheets
            </button>
          ) : (
            <span className="font-semibold text-slate-400">Sign in to build your own resource library!</span>
          )}
        </div>
      )}

      {/* ─── Sheet Selector Navigation ─── */}
      <SheetSelector
        sheets={sheets}
        activeSheet={activeSheet}
        isSharedView={isSharedView}
        fetchSheetDetails={fetchSheetDetails}
        setShowCreateModal={setShowCreateModal}
      />

      {/* ─── Active Collection Container ─── */}
      {activeSheet ? (
        <div id="printable-study-sheet" className="space-y-6">
          <CollectionHeader
            activeSheet={activeSheet}
            isSharedView={isSharedView}
            handlePrintSheet={handlePrintSheet}
            handleExportPdf={handleExportPdf}
            handleExportHtml={handleExportHtml}
            handleDuplicateSheet={handleDuplicateSheet}
            setShowShareModal={setShowShareModal}
            setShowQrModal={setShowQrModal}
            setEditingSheet={setEditingSheet}
            setShowSettingsModal={setShowSettingsModal}
          />

          <ResourceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isSharedView={isSharedView}
            filterType={filterType}
            setFilterType={setFilterType}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            filterSubject={filterSubject}
            setFilterSubject={setFilterSubject}
            filterChapter={filterChapter}
            setFilterChapter={setFilterChapter}
            uniqueTypes={uniqueTypes}
            uniqueSubjects={uniqueSubjects}
            uniqueChapters={uniqueChapters}
            showResourceForm={showResourceForm}
            setShowResourceForm={setShowResourceForm}
            setEditingResource={setEditingResource}
          />

          {/* Form placement */}
          {showResourceForm && !isSharedView && (
            <div className="no-print">
              <ResourceForm
                onAdd={handleAddResource}
                onUpdate={handleUpdateResource}
                editingResource={editingResource}
                onCancelEdit={() => {
                  setEditingResource(null);
                  setShowResourceForm(false);
                }}
              />
            </div>
          )}

          {/* Resources List with Skeletons */}
          {loadingResources ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <ResourceList
              resources={processedResources}
              onDelete={handleDeleteResource}
              onEdit={handleEditSelect}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompleted={handleToggleCompleted}
              isReadOnly={isSharedView}
            />
          )}
        </div>
      ) : (
        /* Empty State */
        <EmptyState />
      )}

      {/* ─── MODAL OVERLAYS ─── */}
      <ShareModal
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        activeSheet={activeSheet}
        getShareLink={getShareLink}
        handleCopyShareLink={handleCopyShareLink}
      />

      <QrModal
        showQrModal={showQrModal}
        setShowQrModal={setShowQrModal}
        activeSheet={activeSheet}
        qrCodeUrl={qrCodeUrl}
        getShareLink={getShareLink}
      />

      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        editingSheet={editingSheet}
        setEditingSheet={setEditingSheet}
        handleUpdateSheet={handleUpdateSheet}
        handleDeleteSheet={handleDeleteSheet}
      />

      <CreateSheetModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newSheetName={newSheetName}
        setNewSheetName={setNewSheetName}
        newSheetDesc={newSheetDesc}
        setNewSheetDesc={setNewSheetDesc}
        newSheetSubject={newSheetSubject}
        setNewSheetSubject={setNewSheetSubject}
        newSheetChapter={newSheetChapter}
        setNewSheetChapter={setNewSheetChapter}
        newSheetPublic={newSheetPublic}
        setNewSheetPublic={setNewSheetPublic}
        handleCreateSheet={handleCreateSheet}
      />
    </div>
  );
};

export default ResourcesTab;

