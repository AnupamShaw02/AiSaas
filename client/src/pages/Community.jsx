import React, { useState, useEffect } from 'react';
import { Heart, Download, Share2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchPublishedImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPublishedImages = async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('Fetching images with auth:', !!token);
      const { data } = await axios.get('/api/ai/published-images', { headers });
      console.log('Received images:', data.images?.length, 'images');
      if (data.success) {
        setCreations(data.images);
      }
    } catch (error) {
      console.error('Error fetching published images:', error);
      toast.error('Failed to load community images');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const token = await getToken();
      console.log('Toggling like for ID:', id, 'with auth:', !!token);
      if (!token) {
        toast.error('Please sign in to like images');
        return;
      }

      // Optimistic update - update UI immediately
      const currentCreation = creations.find(c => c.id === id);
      console.log('Current creation:', currentCreation);
      const optimisticIsLiked = !currentCreation.isLiked;
      const optimisticCount = currentCreation.isLiked
        ? currentCreation.likeCount - 1
        : currentCreation.likeCount + 1;

      setCreations(prevCreations =>
        prevCreations.map(creation =>
          creation.id === id
            ? { ...creation, isLiked: optimisticIsLiked, likeCount: optimisticCount }
            : creation
        )
      );

      // Send request to server
      const { data } = await axios.post('/api/ai/toggle-like', { creationId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Server response:', data);

      // Update with actual server response
      if (data.success) {
        setCreations(prevCreations =>
          prevCreations.map(creation =>
            creation.id === id
              ? { ...creation, isLiked: data.isLiked, likeCount: data.likeCount }
              : creation
          )
        );
      } else {
        // Revert on failure
        setCreations(prevCreations =>
          prevCreations.map(creation =>
            creation.id === id
              ? { ...creation, isLiked: currentCreation.isLiked, likeCount: currentCreation.likeCount }
              : creation
          )
        );
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      console.error('Error response:', error.response?.data);
      // Revert optimistic update on error
      const currentCreation = creations.find(c => c.id === id);
      setCreations(prevCreations =>
        prevCreations.map(creation =>
          creation.id === id
            ? { ...creation, isLiked: currentCreation.isLiked, likeCount: currentCreation.likeCount }
            : creation
        )
      );
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };

  const handleDownload = async (imageUrl, id) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creation-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const handleShare = async (imageUrl, prompt) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Image',
          text: prompt,
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Image link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center bg-[#F4F7FB]'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading community images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-scroll bg-[#F4F7FB] p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-2xl font-semibold text-slate-800 mb-6'>Community Creations</h1>

        {creations.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No published images yet.</p>
            <p className='text-gray-400 text-sm mt-2'>Be the first to share your creation!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {creations.map((item) => (
              <div key={item.id} className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300'>
                {/* Image */}
                <div className='relative group cursor-pointer'>
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    className='w-full h-64 object-cover'
                  />
                  {/* Hover overlay */}
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100'>
                    <button
                      onClick={() => handleDownload(item.imageUrl, item.id)}
                      className='bg-white p-2 rounded-full hover:bg-gray-100 transition'
                    >
                      <Download className='w-5 h-5 text-gray-700' />
                    </button>
                    <button
                      onClick={() => handleShare(item.imageUrl, item.prompt)}
                      className='bg-white p-2 rounded-full hover:bg-gray-100 transition'
                    >
                      <Share2 className='w-5 h-5 text-gray-700' />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className='p-4'>
                  <p className='text-sm text-gray-700 mb-3 line-clamp-2'>
                    {item.prompt}
                  </p>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-gray-500 text-xs'>
                      {item.user.avatar && (
                        <img
                          src={item.user.avatar}
                          alt={item.user.name}
                          className='w-5 h-5 rounded-full'
                        />
                      )}
                      <span>{item.user.name}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => handleLike(item.id)}
                      className='flex items-center gap-1 text-sm'
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          item.isLiked
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <span className={`${
                        item.isLiked ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {item.likeCount || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;