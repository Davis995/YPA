import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { menuApi, categoriesApi } from '../../data/api';
import { MenuItem, MenuCategory } from '../../data/types';
import toast from 'react-hot-toast';

interface MenuFormData {
  name: string;
  description: string;
  price: string;
  image: FileList;
  category: MenuCategory;
}

const AdminMenu: React.FC = () => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: menuApi.getAll,
    refetchInterval:5000
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    refetchInterval:5000
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MenuFormData>();

  const createMutation = useMutation({
    mutationFn: menuApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item created successfully');
      setIsFormOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create menu item');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: FormData }) => 
      menuApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item updated successfully');
      setEditingItem(null);
      reset();
    },
    onError: () => {
      toast.error('Failed to update menu item');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete menu item');
    }
  });

  const onSubmit = (data: MenuFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', String(data.category));
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }
console.log(formData)
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    reset();
  };

  const menuItems = menuData?.data || [];
  const categories = categoriesData?.data || [];

  if (menuLoading || categoriesLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
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
                  className="mt-1 border-2 text-black p-2  block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  className="mt-1 border-2 text-black  block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="text"
                  {...register('price', { required: 'Price is required' })}
                  placeholder="e.g 2000"
                  className="mt-1 border-2 text-black p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="mt-1 border-2 text-black p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                 {
                  categories.map((data:any)=>(
                     <option value={data.id}>{data.name}</option>
                  ))
                 }
              
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                                 <input
                   type="file"
                   accept="image/*"

                   
                   {...register('image', { required: !editingItem ? 'Image is required' : false })}
                   className="mt-1 border-2 text-black p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                )}
                {editingItem && editingItem.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Current image:</p>
                    <img 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${editingItem.image}`} 
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
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item:any) => (
          <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={item.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${item.image}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDEyMFYxNjBIMjgwVjIwMEgyMDBaTTIwMCAxNDBDMTgzLjU4IDE0MCAxNjcuOTY1IDEzMy43ODYgMTU2Ljc4NyAxMjIuMjEzQzE0NS42MDggMTEwLjY0IDEzOS4zNzUgOTQuOTEzIDEzOS4zNzUgNzguNzVDMTM5LjM3NSA2Mi41ODcgMTQ1LjYwOCA0Ni44NiAxNTYuNzg3IDM1LjI4N0MxNjcuOTY1IDIzLjcxNCAxODMuNTggMTcuNSAyMDAgMTcuNUMyMTYuNDIgMTcuNSAyMzIuMDM1IDIzLjcxNCAyNDMuMjEzIDM1LjI4N0MyNTQuMzkyIDQ2Ljg2IDI2MC42MjUgNjIuNTg3IDI2MC42MjUgNzguNzVDMjYwLjYyNSA5NC45MTMgMjU0LjM5MiAxMTAuNjQgMjQzLjIxMyAxMjIuMjEzQzIzMi4wMzUgMTMzLjc4NiAyMTYuNDIgMTQwIDIwMCAxNDBaTTIwMCAxMjBDMjEwLjQ2IDEyMCAyMjAuNTU2IDExNS4yNjggMjI3Ljk4IDEwNy4yNjZDMjM1LjQwNCA5OS4yNjUgMjQwIDg4LjkxMyAyNDAgNzguNzVDMjQwIDY4LjU4NyAyMzUuNDA0IDU4LjIzNSAyMjcuOTggNTAuMjM0QzIyMC41NTYgNDIuMjMyIDIxMC40NiAzNy41IDIwMCAzNy41QzE4OS41NCAzNy41IDE3OS40NDQgNDIuMjMyIDE3Mi4wMiA1MC4yMzRDMTY0LjU5NiA1OC4yMzUgMTYwIDY4LjU4NyAxNjAgNzguNzVDMTYwIDg4LjkxMyAxNjQuNTk2IDk5LjI2NSAxNzIuMDIgMTA3LjI2NkMxNzkuNDQ0IDExNS4yNjggMTg5LjU0IDEyMCAyMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'}
                alt={item.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDEyMFYxNjBIMjgwVjIwMEgyMDBaTTIwMCAxNDBDMTgzLjU4IDE0MCAxNjcuOTY1IDEzMy43ODYgMTU2Ljc4NyAxMjIuMjEzQzE0NS42MDggMTEwLjY0IDEzOS4zNzUgOTQuOTEzIDEzOS4zNzUgNzguNzVDMTM5LjM3NSA2Mi41ODcgMTQ1LjYwOCA0Ni44NiAxNTYuNzg3IDM1LjI4N0MxNjcuOTY1IDIzLjcxNCAxODMuNTggMTcuNSAyMDAgMTcuNUMyMTYuNDIgMTcuNSAyMzIuMDM1IDIzLjcxNCAyNDMuMjEzIDM1LjI4N0MyNTQuMzkyIDQ2Ljg2IDI2MC42MjUgNjIuNTg3IDI2MC42MjUgNzguNzVDMjYwLjYyNSA5NC45MTMgMjU0LjM5MiAxMTAuNjQgMjQzLjIxMyAxMjIuMjEzQzIzMi4wMzUgMTMzLjc4NiAyMTYuNDIgMTQwIDIwMCAxNDBaTTIwMCAxMjBDMjEwLjQ2IDEyMCAyMjAuNTU2IDExNS4yNjggMjI3Ljk4IDEwNy4yNjZDMjM1LjQwNCA5OS4yNjUgMjQwIDg4LjkxMyAyNDAgNzguNzVDMjQwIDY4LjU4NyAyMzUuNDA0IDU4LjIzNSAyMjcuOTggNTAuMjM0QzIyMC41NTYgNDIuMjMyIDIxMC40NiAzNy41IDIwMCAzNy41QzE4OS41NCAzNy41IDE3OS40NDQgNDIuMjMyIDE3Mi4wMiA1MC4yMzRDMTY0LjU5NiA1OC4yMzUgMTYwIDY4LjU4NyAxNjAgNzguNzVDMTYwIDg4LjkxMyAxNjQuNTk2IDk5LjI2NSAxNzIuMDIgMTA3LjI2NkMxNzkuNDQ0IDExNS4yNjggMTg5LjU0IDEyMCAyMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <span className="text-lg font-bold text-indigo-600">Shs {item.price.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{item.description}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {item.categoryName}
              </span>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No menu items</h3>
          <p className="text-sm text-gray-500 mb-6">Get started by adding your first menu item.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;





