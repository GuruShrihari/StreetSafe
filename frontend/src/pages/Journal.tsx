import { useState, useRef, useEffect } from 'react'
import { Book, Plus, Calendar, Sparkles, X, Loader, Image as ImageIcon, CheckCircle } from 'lucide-react'

interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  photos: string[]
  enhanced: boolean
  enhancedContent?: string
}

const STORAGE_KEY = 'journal_entries'

export default function Journal() {
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  
  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [enhancing, setEnhancing] = useState(false)
  const [showEnhancedView, setShowEnhancedView] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem(STORAGE_KEY)
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error('Error loading entries from cache:', error)
      }
    }
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveEntry = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter both title and content')
      return
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      title,
      content,
      photos,
      enhanced: false,
      enhancedContent: ''
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
    
    // Reset form
    setTitle('')
    setContent('')
    setPhotos([])
    setShowNewEntry(false)
  }

  const handleEnhanceWithAI = async (entry: JournalEntry) => {
    setEnhancing(true)
    try {
      const response = await fetch('http://localhost:8000/ai/enhance-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: entry.title,
          content: entry.content,
          photos_count: entry.photos.length,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enhance journal')
      }

      const data = await response.json()
      
      // Update entry with enhanced content
      setEntries(prev =>
        prev.map(e =>
          e.id === entry.id
            ? {
                ...e,
                enhanced: true,
                enhancedContent: data.enhanced_content,
              }
            : e
        )
      )
      
      setShowEnhancedView(true)
      
      // Save enhanced entry to localStorage
      const updatedEntries = entries.map(e =>
        e.id === entry.id
          ? {
              ...e,
              enhanced: true,
              enhancedContent: data.enhanced_content,
            }
          : e
      )
      setEntries(updatedEntries)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
    } catch (error) {
      console.error('Error enhancing journal:', error)
      alert('Failed to enhance journal. Please try again.')
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Book className="h-10 w-10 mr-3 text-purple-600" />
                Memory Hub
              </h1>
              <p className="text-gray-600">Document your daily travel stories, memories, and moments</p>
            </div>
            <button
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Entry
            </button>
          </div>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="card mb-8 border-2 border-blue-200 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Daily Travel Journal</h2>
              <button
                onClick={() => setShowNewEntry(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entry Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Amazing trip to Marina Beach..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Content Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Story
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your experience, feelings, observations, and memories from your trip..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Photos
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">Click to add photos</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveEntry}
              className="w-full btn btn-primary"
            >
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Save Entry
              </>
            </button>
          </div>
        )}

        {/* Journal Entries */}
        {entries.length === 0 ? (
          <div className="card text-center py-16 border-2 border-dashed border-blue-200">
            <Book className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start Your Memory Hub</h2>
            <p className="text-gray-600 mb-8">
              Begin documenting your travel stories, create memories, and let AI enhance your narratives
            </p>
            <button
              onClick={() => setShowNewEntry(true)}
              className="btn btn-primary mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="card border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                {/* Entry Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {entry.date}
                    </p>
                  </div>
                  {entry.enhanced && (
                    <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      <Sparkles className="h-3 w-3" />
                      AI Enhanced
                    </div>
                  )}
                </div>

                {/* Display Enhanced Content if Available */}
                {entry.enhanced && entry.enhancedContent && !showEnhancedView ? (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhanced Version
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.enhancedContent}</p>
                  </div>
                ) : (
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>
                )}

                {/* Photos */}
                {entry.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {entry.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Memory ${idx + 1}`}
                        className="h-32 w-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                {/* AI Enhance Button */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEnhanceWithAI(entry)}
                    disabled={enhancing || entry.enhanced}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      entry.enhanced
                        ? 'bg-gray-100 text-gray-600 cursor-default'
                        : enhancing
                        ? 'bg-blue-500 text-white opacity-75'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {enhancing ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Enhancing...</span>
                      </>
                    ) : entry.enhanced ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Already Enhanced</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Enhance with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
