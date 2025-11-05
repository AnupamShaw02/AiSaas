import React, { useState } from 'react';
import { Heart, Download, Share2 } from 'lucide-react';

const Community = () => {
  const [likedItems, setLikedItems] = useState({});

  // Sample creations data
  const creations = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
      prompt: 'Generate an image of A Boy is on Boat, and fishing in the style Anime style.',
      likes: 2,
      user: 'User123',
      date: '2024-10-28'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop',
      prompt: 'Boy riding bicycle through sunny tree-lined street in anime style.',
      likes: 2,
      user: 'ArtLover',
      date: '2024-10-27'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop',
      prompt: 'Peaceful mountain landscape with lake reflection at sunset.',
      likes: 5,
      user: 'NatureArt',
      date: '2024-10-26'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      prompt: 'Serene mountain view with cloudy sky in realistic style.',
      likes: 3,
      user: 'Dreamer',
      date: '2024-10-25'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
      prompt: 'Vibrant sunset over ocean waves in fantasy style.',
      likes: 7,
      user: 'OceanVibes',
      date: '2024-10-24'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      prompt: 'Forest path with morning sunlight streaming through trees.',
      likes: 4,
      user: 'ForestWalk',
      date: '2024-10-23'
    }
  ];

  const handleLike = (id) => {
    setLikedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className='h-full overflow-y-scroll bg-[#F4F7FB] p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-2xl font-semibold text-slate-800 mb-6'>Creations</h1>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {creations.map((item) => (
            <div key={item.id} className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300'>
              {/* Image */}
              <div className='relative group cursor-pointer'>
                <img 
                  src={item.image} 
                  alt={item.prompt}
                  className='w-full h-64 object-cover'
                />
                {/* Hover overlay */}
                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100'>
                  <button className='bg-white p-2 rounded-full hover:bg-gray-100 transition'>
                    <Download className='w-5 h-5 text-gray-700' />
                  </button>
                  <button className='bg-white p-2 rounded-full hover:bg-gray-100 transition'>
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
                    <span>{item.user}</span>
                    <span>•</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleLike(item.id)}
                    className='flex items-center gap-1 text-sm'
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${
                        likedItems[item.id] 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400'
                      }`}
                    />
                    <span className={`${
                      likedItems[item.id] ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {item.likes + (likedItems[item.id] ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;