// app/gallery/page.tsx - Photo Gallery
'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Photo {
  id: string
  url: string
  caption: string
  uploaded_by: string
  uploader_name: string
  event_id: string | null
  likes_count: number
  comments_count: number
  created_at: string
}

interface Comment {
  id: string
  photo_id: string
  member_id: string
  member_name: string
  content: string
  created_at: string
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [likedPhotos, setLikedPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
    if (user) {
      fetchUserLikes()
    }
  }, [])

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error fetching photos')
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const fetchUserLikes = async () => {
    const { data, error } = await supabase
      .from('photo_likes')
      .select('photo_id')
      .eq('member_id', user?.id)

    if (!error && data) {
      setLikedPhotos(data.map(l => l.photo_id))
    }
  }

  const fetchComments = async (photoId: string) => {
    const { data, error } = await supabase
      .from('photo_comments')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: true })

    if (error) {
      toast.error('Error fetching comments')
    } else {
      setComments(data || [])
    }
  }

  const handlePhotoClick = async (photo: Photo) => {
    setSelectedPhoto(photo)
    await fetchComments(photo.id)
  }

  const handleLike = async (photoId: string) => {
    if (!user) {
      toast.error('Please login to like photos')
      return
    }

    const isLiked = likedPhotos.includes(photoId)

    if (isLiked) {
      const { error } = await supabase
        .from('photo_likes')
        .delete()
        .eq('photo_id', photoId)
        .eq('member_id', user.id)

      if (!error) {
        setLikedPhotos(likedPhotos.filter(id => id !== photoId))
        setPhotos(photos.map(p => 
          p.id === photoId ? { ...p, likes_count: p.likes_count - 1 } : p
        ))
      }
    } else {
      const { error } = await supabase
        .from('photo_likes')
        .insert([{ photo_id: photoId, member_id: user.id }])

      if (!error) {
        setLikedPhotos([...likedPhotos, photoId])
        setPhotos(photos.map(p => 
          p.id === photoId ? { ...p, likes_count: p.likes_count + 1 } : p
        ))
      }
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPhoto || !newComment.trim()) return

    const { data, error } = await supabase
      .from('photo_comments')
      .insert([{
        photo_id: selectedPhoto.id,
        member_id: user.id,
        member_name: user.user_metadata?.full_name,
        content: newComment
      }])
      .select()
      .single()

    if (error) {
      toast.error('Error adding comment')
    } else {
      toast.success('Comment added!')
      setNewComment('')
      setComments([...comments, data])
      setPhotos(photos.map(p => 
        p.id === selectedPhoto.id ? { ...p, comments_count: p.comments_count + 1 } : p
      ))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `gallery/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Error uploading photo')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath)

    const caption = prompt('Enter a caption for your photo:') || ''

    const { error: dbError } = await supabase
      .from('gallery_photos')
      .insert([{
        url: urlData.publicUrl,
        caption,
        uploaded_by: user.id,
        uploader_name: user.user_metadata?.full_name,
        likes_count: 0,
        comments_count: 0
      }])

    if (dbError) {
      toast.error('Error saving photo info')
    } else {
      toast.success('Photo uploaded successfully!')
      fetchPhotos()
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) return <div className="text-center py-12">Loading gallery...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Photo Gallery</h1>
          <p className="mt-1 text-sm text-gray-600">Share and relive RADLAG memories</p>
        </div>
        {user && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No photos in the gallery yet</p>
          {user && <p className="text-sm text-gray-400">Be the first to upload a photo!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-square relative">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-900 truncate">{photo.caption}</p>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(photo.id)
                      }}
                      className="flex items-center space-x-1 hover:text-red-500"
                    >
                      {likedPhotos.includes(photo.id) ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span>{photo.likes_count}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span>{photo.comments_count}</span>
                    </div>
                  </div>
                  <span className="text-xs">{new Date(photo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedPhoto(null)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3 bg-gray-900 flex items-center justify-center p-4">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.caption}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>

                <div className="md:w-1/3 flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{selectedPhoto.uploader_name}</p>
                      <p className="text-sm text-gray-500">{new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-700">{selectedPhoto.caption}</p>
                    <button
                      onClick={() => handleLike(selectedPhoto.id)}
                      className="mt-3 flex items-center space-x-2 text-gray-600 hover:text-red-500"
                    >
                      {likedPhotos.includes(selectedPhoto.id) ? (
                        <HeartSolidIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6" />
                      )}
                      <span>{selectedPhoto.likes_count} likes</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                    <h4 className="font-medium text-gray-900">Comments ({comments.length})</h4>
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{comment.member_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {user && (
                    <div className="p-4 border-t">
                      <form onSubmit={handleAddComment} className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}