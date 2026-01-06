import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Dashboard = () => {

  const [creation, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const getDashboardData = async () => {
    try {
      setLoading(true)
      const token = await getToken()

      const { data } = await axios.get('/api/ai/user-creations', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message || 'Failed to load creations')
      }
    } catch (error) {
      console.error('Error fetching user creations:', error)
      toast.error(error.response?.data?.message || 'Failed to load your creations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    getDashboardData()

  }, [])
  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        {/* Total Creations card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creation.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>

        {/* Active Plan card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <protect plan='premium' fallback='Free' >Premium</protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>

        <div className='space-y-3 w-full'>
          <p className='mt-6 mb-4'>Recent Creations</p>
          {loading ? (
            <div className='text-center py-8'>
              <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
              <p className='text-gray-500 mt-3'>Loading your creations...</p>
            </div>
          ) : creation.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <p>No creations yet. Start creating something amazing!</p>
            </div>
          ) : (
            creation.map((item)=> <CreationItem key={item.id} item={item}/>)
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard
