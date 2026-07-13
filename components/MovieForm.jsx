import React, { useState, useEffect } from 'react';

const MovieForm = ({ movie = null, onSubmit, onCancel, theme }) => {
  const isDark = theme === 'dark';
  const inputClass = isDark ? 'border-slate-600 bg-slate-700/80 text-white placeholder:text-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500';
  const labelClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const buttonSecondaryClass = isDark ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-slate-200 text-slate-800 hover:bg-slate-300';

  const [formData, setFormData] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    posterUrl: movie?.posterUrl || '',
    price: movie?.price || 0,
  });

  // Update form data when movie prop changes
  useEffect(() => {
    if (movie && movie.id) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        posterUrl: (movie.posterUrl || '').trim(),
        price: movie.price ? parseFloat(movie.price) : 0,
      });
    } else {
      setFormData({ title: '', description: '', posterUrl: '', price: 0 });
    }
  }, [movie]);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Trim and validate all fields before submission
      const submitData = {
        title: (formData.title || '').trim(),
        description: (formData.description || '').trim(),
        posterUrl: (formData.posterUrl || '').trim(),
        price: parseFloat(formData.price) || 0,
      };
      
      // Validate required fields
      if (!submitData.title) {
        alert('Title is required');
        return;
      }
      if (!submitData.description) {
        alert('Description is required');
        return;
      }
      if (!submitData.posterUrl) {
        alert('Poster URL is required');
        return;
      }
      
      // Validate that price is positive
      if (submitData.price < 0) {
        alert('Price must be a positive number');
        return;
      }
      
      if (onSubmit) {
        onSubmit(submitData);
      }
      if (!movie) {
        setFormData({ title: '', description: '', posterUrl: '', price: 0 });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Poster URL</label>
        <input
          type="url"
          required
          value={formData.posterUrl}
          onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className={`mb-1 block text-sm font-medium ${labelClass}`}>Price</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => {
            const value = e.target.value;
            // Store as number, but allow empty during typing
            const numValue = value === '' ? 0 : parseFloat(value);
            setFormData({ ...formData, price: isNaN(numValue) ? 0 : numValue });
          }}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
        >
          {movie ? 'Update' : 'Add'} Movie
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-lg px-6 py-2 font-semibold transition-colors ${buttonSecondaryClass}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MovieForm;

