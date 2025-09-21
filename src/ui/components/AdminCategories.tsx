import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { categoriesApi } from '../../data/api';
import { Category } from '../../data/types';
import toast from 'react-hot-toast';

interface CategoryFormData {
  name: string;
  description: string;
  image: FileList;
}

const AdminCategories: React.FC = () => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    refetchInterval:2000
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>();

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      setIsFormOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: FormData }) => 
      categoriesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      reset();
    },
    onError: () => {
      toast.error('Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete category');
    }
  });

  const onSubmit = (data: CategoryFormData) => {
    console.log(data)
    const formdata = new FormData()
    formdata.append("name",data.name)
    formdata.append("description",data.description)
    if(data.image && data.image.length > 0){
      formdata.append("image",data.image[0])
    }
    console.log(formdata)
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, updates: formdata });
    } else {
      createMutation.mutate(formdata);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description,
    
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: any) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    reset();
  };

  const categories = categoriesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your menu categories</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && ( 
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 border-2 text-black p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1  text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  className="mt-1 border-2 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                                 <input
                   type="file"
                   accept="image/*"
                   {...register('image', { required: !editingCategory ? 'Image is required' : false })}
                   className="mt-1 p-2 border-2 text-black block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                )}
                {editingCategory && editingCategory.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Current image:</p>
                    <img 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${editingCategory.image}`} 
                      alt="Current" 
                      className="mt-1 h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category:any) => (
          <div key={category.id} className="bg-white overflow-hidden shadow rounded-lg">
                         <div className="aspect-w-16 aspect-h-9">
               <img
                 src={category.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${category.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDEyMFYxNjBIMjgwVjIwMEgyMDBaTTIwMCAxNDBDMTgzLjU4IDE0MCAxNjcuOTY1IDEzMy43ODYgMTU2Ljc4NyAxMjIuMjEzQzE0NS42MDggMTEwLjY0IDEzOS4zNzUgOTQuOTEzIDEzOS4zNzUgNzguNzVDMTM5LjM3NSA2Mi41ODcgMTQ1LjYwOCA0Ni44NiAxNTYuNzg3IDM1LjI4N0MxNjcuOTY1IDIzLjcxNCAxODMuNTggMTcuNSAyMDAgMTcuNUMyMTYuNDIgMTcuNSAyMzIuMDM1IDIzLjcxNCAyNDMuMjEzIDM1LjI4N0MyNTQuMzkyIDQ2Ljg2IDI2MC42MjUgNjIuNTg3IDI2MC42MjUgNzguNzVDMjYwLjYyNSA5NC45MTMgMjU0LjM5MiAxMTAuNjQgMjQzLjIxMyAxMjIuMjEzQzIzMi4wMzUgMTMzLjc4NiAyMTYuNDIgMTQwIDIwMCAxNDBaTTIwMCAxMjBDMjEwLjQ2IDEyMCAyMjAuNTU2IDExNS4yNjggMjI3Ljk4IDEwNy4yNjZDMjM1LjQwNCA5OS4yNjUgMjQwIDg4LjkxMyAyNDAgNzguNzVDMjQwIDY4LjU4NyAyMzUuNDA0IDU4LjIzNSAyMjcuOTggNTAuMjM0QzIyMC41NTYgNDIuMjMyIDIxMC40NiAzNy41IDIwMCAzNy41QzE4OS41NCAzNy41IDE3OS40NDQgNDIuMjMyIDE3Mi4wMiA1MC4yMzRDMTY0LjU5NiA1OC4yMzUgMTYwIDY4LjU4NyAxNjAgNzguNzVDMTYwIDg4LjkxMyAxNjQuNTk2IDk5LjI2NSAxNzIuMDIgMTA3LjI2NkMxNzkuNDQ0IDExNS4yNjggMTg5LjU0IDEyMCAyMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'}
                 alt={category.name}
                 className="w-full h-48 object-cover"
                 onError={(e) => {
                   e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDEyMFYxNjBIMjgwVjIwMEgyMDBaTTIwMCAxNDBDMTgzLjU4IDE0MCAxNjcuOTY1IDEzMy43ODYgMTU2Ljc4NyAxMjIuMjEzQzE0NS42MDggMTEwLjY0IDEzOS4zNzUgOTQuOTEzIDEzOS4zNzUgNzguNzVDMTM5LjM3NSA2Mi41ODcgMTQ1LjYwOCA0Ni44NiAxNTYuNzg3IDM1LjI4N0MxNjcuOTY1IDIzLjcxNCAxODMuNTggMTcuNSAyMDAgMTcuNUMyMTYuNDIgMTcuNSAyMzIuMDM1IDIzLjcxNCAyNDMuMjEzIDM1LjI4N0MyNTQuMzkyIDQ2Ljg2IDI2MC42MjUgNjIuNTg3IDI2MC42MjUgNzguNzVDMjYwLjYyNSA5NC45MTMgMjU0LjM5MiAxMTAuNjQgMjQzLjIxMyAxMjIuMjEzQzIzMi4wMzUgMTMzLjc86IDIxNi40MiAxNDAgMjAwIDE0MFpNMjAwIDEyMEMyMTAuNDYgMTIwIDIyMC41NTYgMTE1LjI2OCAyMjcuOTggMTA3LjI2NkMyMzUuNDA0IDk5LjI2NSAyNDAgODguOTEzIDI0MCA3OC43NUMyNDAgNjguNTg3IDIzNS40MDQgNTguMjM1IDIyNy45OCA1MC4yMzRDMjIwLjU1NiA0Mi4yMzIgMjEwLjQ2IDM3LjUgMjAwIDM3LjVDMTg5LjU0IDM3LjUgMTc5LjQ0NCA0Mi4yMzIgMTcyLjAyIDUwLjIzNEMxNjQuNTk2IDU4LjIzNSAxNjAgNjguNTg3IDE2MCA3OC43NUMxNjAgODguOTEzIDE2NC41OTYgOTkuMjY1IDE3Mi4wMiAxMDcuMjY2QzE3OS40NDQgMTE1LjI2OCAxODkuNTQgMTIwIDIwMCAxMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                 }}
               />
             </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No categories</h3>
          <p className="text-sm text-gray-500 mb-6">Get started by creating a new category.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;





