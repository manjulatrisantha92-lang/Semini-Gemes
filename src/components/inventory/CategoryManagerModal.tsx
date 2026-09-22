import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Gem,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCategoriesUpdated: () => void;
}

const QUICK_SUGGESTIONS = [
  'Anklets & Chains',
  'Brooches & Pins',
  'Luxury Watches',
  'Silver Giftware',
  'Custom Wedding Bands',
  'Nose Pins & Studs',
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onCategoriesUpdated,
}) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<string[]>(() =>
    StorageService.getProductCategories()
  );

  // New Category input
  const [newCategoryName, setNewCategoryName] = useState('');

  // Editing Category state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  // Delete confirmation state
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [fallbackCategory, setFallbackCategory] = useState<string>('Rings');

  // Refresh categories from storage
  const reloadCategories = () => {
    const updated = StorageService.getProductCategories();
    setCategories(updated);
    onCategoriesUpdated();
  };

  // Add Category
  const handleAddCategory = (nameToAdd?: string) => {
    const name = (nameToAdd || newCategoryName).trim();
    if (!name) return;

    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      showToast(`Category "${name}" already exists!`, 'error');
      return;
    }

    StorageService.addProductCategory(name);
    setNewCategoryName('');
    reloadCategories();
    showToast(`Category "${name}" added successfully!`, 'success');
  };

  // Start Edit
  const handleStartEdit = (cat: string) => {
    setEditingCategory(cat);
    setEditNameValue(cat);
  };

  // Save Edit
  const handleSaveEdit = (oldCat: string) => {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCategory(null);
      return;
    }

    if (
      categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== oldCat.toLowerCase()
      )
    ) {
      showToast(`A category named "${trimmed}" already exists!`, 'error');
      return;
    }

    StorageService.updateProductCategory(oldCat, trimmed);
    setEditingCategory(null);
    reloadCategories();
    showToast(`Category renamed to "${trimmed}". Associated items updated!`, 'success');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    if (categories.length <= 1) {
      showToast('Cannot delete the last remaining category.', 'error');
      setDeletingCategory(null);
      return;
    }

    const targetCat = deletingCategory;
    const targetFallback =
      fallbackCategory === targetCat
        ? categories.find((c) => c !== targetCat) || 'Rings'
        : fallbackCategory;

    StorageService.deleteProductCategory(targetCat, targetFallback);
    setDeletingCategory(null);
    reloadCategories();
    showToast(`Category "${targetCat}" removed. Products moved to "${targetFallback}".`, 'info');
  };

  // Count items per category
  const getItemCount = (category: string) => {
    return products.filter((p) => p.category === category).length;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Categories Manager"
      subtitle="Create, edit, rename, and manage jewelry & gemstone categories"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Create New Category Form */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add New Category</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Brooches & Pins, Luxury Watches, Anklets..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleAddCategory()}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Add Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.filter(
                (sug) => !categories.some((c) => c.toLowerCase() === sug.toLowerCase())
              ).map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleAddCategory(sug)}
                  className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 hover:text-amber-300 text-slate-300 border border-slate-700/80 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-amber-400" />
              Active Categories ({categories.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Total Stocked Items: {products.length}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
            {categories.map((cat) => {
              const count = getItemCount(cat);
              const isEditing = editingCategory === cat;

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors group"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(cat);
                          if (e.key === 'Escape') setEditingCategory(null);
                        }}
                        autoFocus
                        className="flex-1 bg-slate-950 border border-amber-500 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(cat)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                        title="Save Changes"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 truncate">
                      <Gem className="w-4 h-4 text-amber-400/80 shrink-0" />
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {cat}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {count} items
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded transition-colors"
                        title={`Edit / Rename category "${cat}"`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingCategory(cat);
                          const remaining = categories.filter((c) => c !== cat);
                          setFallbackCategory(remaining[0] || 'Rings');
                        }}
                        disabled={categories.length <= 1}
                        className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title={`Remove category "${cat}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete Category Confirmation Dialog */}
        {deletingCategory && (
          <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">
                  Delete Category &quot;{deletingCategory}&quot;?
                </p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  There are {getItemCount(deletingCategory)} product(s) in this category.
                  Select which category to reassign them to:
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Move products to:</span>
              <select
                value={fallbackCategory}
                onChange={(e) => setFallbackCategory(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
              >
                {categories
                  .filter((c) => c !== deletingCategory)
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs"
              >
                Confirm Delete & Reassign
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
