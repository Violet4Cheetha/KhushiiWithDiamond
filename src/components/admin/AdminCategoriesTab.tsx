import React, { useState, useEffect } from 'react';
import { supabase, Category, JewelryItem } from '../../lib/supabase';
import { Plus, Edit, Trash2, Save, X, Image, ChevronRight, Folder, FolderOpen } from 'lucide-react';

interface AdminCategoriesTabProps {
  items: JewelryItem[];
  onCategoriesChange: () => void;
}

export function AdminCategoriesTab({ items, onCategoriesChange }: AdminCategoriesTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '', description: '', image_url: '', parent_id: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) {
        setCategories(data);
        onCategoriesChange();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '', image_url: '', parent_id: '' });
    setShowAddCategoryForm(false);
    setEditingCategory(null);
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
    });
    setShowAddCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...categoryFormData,
      parent_id: categoryFormData.parent_id || null,
    };

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(submitData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([submitData]);
        if (error) throw error;
      }
      
      await loadCategories();
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please check your permissions and try again.');
    }
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    // Check for items in this category
    const itemCount = items.filter(item => item.category === categoryName).length;
    
    // Check for subcategories
    const subcategories = categories.filter(cat => cat.parent_id === id);
    
    if (itemCount > 0) {
      alert(`Cannot delete category "${categoryName}" because it contains ${itemCount} items. Please move or delete the items first.`);
      return;
    }

    if (subcategories.length > 0) {
      alert(`Cannot delete category "${categoryName}" because it has ${subcategories.length} subcategories. Please delete the subcategories first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please check your permissions and try again.');
      }
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Organize categories into hierarchy
  const topLevelCategories = categories.filter(cat => !cat.parent_id);
  const getSubcategories = (parentId: string) => 
    categories.filter(cat => cat.parent_id === parentId);

  const getItemCount = (categoryName: string) => 
    items.filter(item => item.category === categoryName).length;

  const getImageCount = (category: Category) => 
    category.image_url 
      ? category.image_url.split(',').map(url => url.trim()).filter(url => url).length
      : 0;

  const CategoryCard = ({ category, isSubcategory = false }: { category: Category; isSubcategory?: boolean }) => {
    const itemCount = getItemCount(category.name);
    const imageCount = getImageCount(category);
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div className={`${isSubcategory ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="relative h-32">
            <img
              src={category.image_url?.split(',')[0]?.trim() || 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg'}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={() => startEditCategory(category)}
                className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100"
              >
                <Edit className="h-4 w-4 text-yellow-600" />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id, category.name)}
                className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
            {imageCount > 1 && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <Image className="h-3 w-3" />
                <span>{imageCount}</span>
              </div>
            )}
            {isSubcategory && (
              <div className="absolute bottom-2 left-2 bg-blue-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs">
                Subcategory
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              {hasSubcategories && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <span className="text-sm">{subcategories.length}</span>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{itemCount} items</span>
              {hasSubcategories && (
                <span>{subcategories.length} subcategories</span>
              )}
            </div>
          </div>
        </div>

        {/* Render subcategories */}
        {hasSubcategories && isExpanded && (
          <div className="space-y-4">
            {subcategories.map((subcategory) => (
              <CategoryCard key={subcategory.id} category={subcategory} isSubcategory={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories & Subcategories</h2>
          <p className="text-gray-600">Manage your hierarchical category structure</p>
        </div>
        <button
          onClick={() => setShowAddCategoryForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="space-y-6">
        {topLevelCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        
        {topLevelCategories.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Create your first category to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Form Modal */}
      {showAddCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={resetCategoryForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={categoryFormData.parent_id}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">None (Top-level category)</option>
                  {topLevelCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to create a top-level category, or select a parent to create a subcategory.
                </p>
              </div>

              {[
                { label: 'Name', key: 'name', required: true, placeholder: 'e.g., Heavy Rings, Light Rings' },
                { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Brief description of the category' },
              ].map(({ label, key, type = 'text', required, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={categoryFormData[key as keyof typeof categoryFormData]}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                      rows={3}
                      placeholder={placeholder}
                    />
                  ) : (
                    <input
                      type={type}
                      required={required}
                      value={categoryFormData[key as keyof typeof categoryFormData]}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URLs (comma separated)
                </label>
                <textarea
                  value={categoryFormData.image_url}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add multiple image URLs separated by commas for category slideshow.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingCategory ? 'Update' : 'Add'} Category</span>
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}