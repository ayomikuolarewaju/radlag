'use client'

import { useState, useEffect, useRef } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Photo {
  id: string
  url: string
  caption: string
  uploader_name: string
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
  const { member } = useMembershipAuth()
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
    if (member) fetchUserLikes()
  }, [member])

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error('Error fetching photos')
    else setPhotos(data || [])
    setLoading(false)
  }

  const fetchUserLikes = async () => {
    if (!member) return
    const { data } = await supabase
      .from('photo_likes')
      .select('photo_id')
      .eq('member_id', member.id)
    if (data) setLikedPhotos(data.map(l => l.photo_id))
  }

  const fetchComments = async (photoId: string) => {
    const { data, error } = await supabase
      .from('photo_comments')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: true })
    if (error) toast.error('Error fetching comments')
    else setComments(data || [])
  }

  const handlePhotoClick = async (photo: Photo) => {
    setSelectedPhoto(photo)
    await fetchComments(photo.id)
  }

  const handleLike = async (photoId: string) => {
    if (!member) { toast.error('Please login to like photos'); return }
    const isLiked = likedPhotos.includes(photoId)
    if (isLiked) {
      await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('member_id', member.id)
      setLikedPhotos(likedPhotos.filter(id => id !== photoId))
      setPhotos(photos.map(p => p.id === photoId ? { ...p, likes_count: p.likes_count - 1 } : p))
    } else {
      await supabase.from('photo_likes').insert([{ photo_id: photoId, member_id: member.id }])
      setLikedPhotos([...likedPhotos, photoId])
      setPhotos(photos.map(p => p.id === photoId ? { ...p, likes_count: p.likes_count + 1 } : p))
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member || !selectedPhoto || !newComment.trim()) return
    const { data, error } = await supabase
      .from('photo_comments')
      .insert([{ photo_id: selectedPhoto.id, member_id: member.id, member_name: member.full_name, content: newComment }])
      .select().single()
    if (error) toast.error('Error adding comment')
    else {
      toast.success('Comment added!')
      setNewComment('')
      setComments([...comments, data])
      setPhotos(photos.map(p => p.id === selectedPhoto.id ? { ...p, comments_count: p.comments_count + 1 } : p))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !member) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }

    setUploading(true)
    const filePath = `gallery/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file)
    if (uploadError) { toast.error('Upload failed'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath)
    const caption = prompt('Enter a caption for your photo:') || ''

    const { error: dbError } = await supabase.from('gallery_photos').insert([{
      url: urlData.publicUrl, caption, uploaded_by: member.id,
      uploader_name: member.full_name, likes_count: 0, comments_count: 0
    }])
    if (dbError) toast.error('Error saving photo')
    else { toast.success('Photo uploaded!'); fetchPhotos() }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) return <div className="text-center py-12">Loading gallery...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Photo Gallery"
          titleYoruba="Ibi Àwòrán Wa"
          description="Share and relive memorable moments from RADLAG events and gatherings"       />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-gray-500">{photos.length} photos</p>
          {member && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className={`inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 cursor-pointer text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <ArrowUpTrayIcon className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
            </>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No photos yet — be the first to upload!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePhotoClick(photo)}>
                <div className="aspect-square">
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 truncate">{photo.caption}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button onClick={(e) => { e.stopPropagation(); handleLike(photo.id) }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500">
                      {likedPhotos.includes(photo.id) ? <HeartSolidIcon className="h-4 w-4 text-red-500" /> : <HeartIcon className="h-4 w-4" />}
                      {photo.likes_count}
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ChatBubbleLeftIcon className="h-4 w-4" />{photo.comments_count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75" onClick={() => setSelectedPhoto(null)}>
            <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1 z-10">
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="md:w-2/3 bg-gray-900 flex items-center justify-center">
                <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="max-w-full max-h-[70vh] object-contain" />
              </div>

              <div className="md:w-1/3 flex flex-col">
                <div className="p-4 border-b">
                  <p className="font-medium text-gray-900">{selectedPhoto.uploader_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedPhoto.caption}</p>
                  <button onClick={() => handleLike(selectedPhoto.id)} className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-red-500">
                    {likedPhotos.includes(selectedPhoto.id) ? <HeartSolidIcon className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
                    {selectedPhoto.likes_count} likes
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">{c.member_name}</p>
                      <p className="text-sm text-gray-600">{c.content}</p>
                    </div>
                  ))}
                </div>

                {member && (
                  <div className="p-4 border-t">
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text" value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      />
                      <button type="submit" disabled={!newComment.trim()} className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-sm disabled:opacity-50">
                        Post
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
