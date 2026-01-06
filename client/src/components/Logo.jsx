import React from 'react'

const Logo = ({ className = '' }) => {
  return (
    <div className={`font-bold text-2xl ${className}`}>
      <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
        Multimind
      </span>
      <span className='text-gray-800 ml-1'>ai</span>
    </div>
  )
}

export default Logo
