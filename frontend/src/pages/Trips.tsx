import { Route, Clock, MapPin, Sparkles, Package, Calendar, Users, MapPinIcon } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface ItineraryItem {
  time: string
  activity: string
  location: string
  duration: string
  notes: string
}

interface PackingItem {
  category: string
  items: string[]
}

export default function Trips() {
  const [activeTab, setActiveTab] = useState<'builder' | 'packing'>('builder')
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false)
  const [showPackingAssistant, setShowPackingAssistant] = useState(false)

  // Itinerary Builder State
  const [destination, setDestination] = useState('')
  const [tripDays, setTripDays] = useState(3)
  const [travelStyle, setTravelStyle] = useState<'adventure' | 'relaxation' | 'cultural' | 'budget'>('adventure')
  const [interests, setInterests] = useState<string[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[] | null>(null)
  const [itineraryLoading, setItineraryLoading] = useState(false)

  // Packing Assistant State
  const [packingDestination, setPackingDestination] = useState('')
  const [packingWeather, setPackingWeather] = useState<'hot' | 'cold' | 'rainy' | 'mixed'>('mixed')
  const [packingDuration, setPackingDuration] = useState(3)
  const [packingActivities, setPackingActivities] = useState<string[]>([])
  const [packingList, setPackingList] = useState<PackingItem[] | null>(null)
  const [packingLoading, setPackingLoading] = useState(false)

  const interestOptions = ['Beach', 'Mountains', 'History', 'Food', 'Art', 'Shopping', 'Nightlife', 'Nature']
  const activityOptions = ['Hiking', 'Swimming', 'Business Meetings', 'Formal Events', 'Casual Walking', 'Photography']

  const generateItinerary = async () => {
    if (!destination || !tripDays) {
      alert('Please fill in all fields')
      return
    }

    setItineraryLoading(true)
    try {
      const response = await fetch('http://localhost:8000/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days: tripDays,
          travel_style: travelStyle,
          interests: interests.length > 0 ? interests : []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }

      const data = await response.json()
      setItinerary(data.itinerary)
    } catch (error) {
      console.error('Error generating itinerary:', error)
      alert(`Failed to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setItineraryLoading(false)
    }
  }

  const generatePackingList = async () => {
    if (!packingDestination || !packingDuration) {
      alert('Please fill in all fields')
      return
    }

    setPackingLoading(true)
    try {
      const response = await fetch('http://localhost:8000/ai/generate-packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: packingDestination,
          duration: packingDuration,
          weather: packingWeather,
          activities: packingActivities.length > 0 ? packingActivities : []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }

      const data = await response.json()
      setPackingList(data.packing_list)
    } catch (error) {
      console.error('Error generating packing list:', error)
      alert(`Failed to generate packing list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setPackingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
          <p className="text-gray-600">View, plan, and manage your travel adventures</p>
        </div>

        {/* AI Tools Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Itinerary Builder */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
              <Sparkles className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Itinerary Builder</h2>
            </div>

            {!showItineraryBuilder ? (
              <button
                onClick={() => setShowItineraryBuilder(true)}
                className="w-full btn btn-primary text-center py-8 flex flex-col items-center justify-center space-y-3"
              >
                <Calendar className="h-8 w-8" />
                <span>Create AI-Powered Itinerary</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Paris, Bali, Tokyo"
                    className="input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={tripDays}
                      onChange={(e) => setTripDays(parseInt(e.target.value))}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value as any)}
                      className="input w-full"
                    >
                      <option value="adventure">Adventure</option>
                      <option value="relaxation">Relaxation</option>
                      <option value="cultural">Cultural</option>
                      <option value="budget">Budget</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        onClick={() =>
                          setInterests(
                            interests.includes(interest)
                              ? interests.filter((i) => i !== interest)
                              : [...interests, interest]
                          )
                        }
                        className={clsx(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          interests.includes(interest)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateItinerary}
                  disabled={itineraryLoading}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {itineraryLoading ? 'Generating...' : 'Generate Itinerary'}
                </button>

                {itinerary && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h3 className="font-semibold text-gray-900">Your Itinerary</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {itinerary.map((item, idx) => (
                        <div key={idx} className="p-3 bg-primary-50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-primary-900">{item.time}</span>
                            <span className="text-xs text-primary-700">{item.duration}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{item.activity}</p>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.location}
                          </p>
                          {item.notes && <p className="text-xs text-gray-700 mt-2">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowItineraryBuilder(false)}
                      className="w-full btn btn-secondary text-sm"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Packing Assistant */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
              <Package className="h-6 w-6 text-success-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Packing Assistant</h2>
            </div>

            {!showPackingAssistant ? (
              <button
                onClick={() => setShowPackingAssistant(true)}
                className="w-full btn btn-success text-center py-8 flex flex-col items-center justify-center space-y-3"
              >
                <Package className="h-8 w-8" />
                <span>Generate Smart Packing List</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <input
                    type="text"
                    value={packingDestination}
                    onChange={(e) => setPackingDestination(e.target.value)}
                    placeholder="e.g., Bangkok, London, Dubai"
                    className="input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trip Duration</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={packingDuration}
                      onChange={(e) => setPackingDuration(parseInt(e.target.value))}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weather</label>
                    <select
                      value={packingWeather}
                      onChange={(e) => setPackingWeather(e.target.value as any)}
                      className="input w-full"
                    >
                      <option value="hot">Hot & Sunny</option>
                      <option value="cold">Cold & Snowy</option>
                      <option value="rainy">Rainy & Humid</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {activityOptions.map((activity) => (
                      <button
                        key={activity}
                        onClick={() =>
                          setPackingActivities(
                            packingActivities.includes(activity)
                              ? packingActivities.filter((a) => a !== activity)
                              : [...packingActivities, activity]
                          )
                        }
                        className={clsx(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          packingActivities.includes(activity)
                            ? 'bg-success-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generatePackingList}
                  disabled={packingLoading}
                  className="w-full btn btn-success disabled:opacity-50"
                >
                  {packingLoading ? 'Generating...' : 'Generate Packing List'}
                </button>

                {packingList && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h3 className="font-semibold text-gray-900">Packing Checklist</h3>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {packingList.map((category, idx) => (
                        <div key={idx} className="p-3 bg-success-50 rounded-lg">
                          <h4 className="font-semibold text-success-900 mb-2">{category.category}</h4>
                          <ul className="space-y-1">
                            {category.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-center text-sm text-gray-700">
                                <input type="checkbox" className="mr-2 rounded" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowPackingAssistant(false)}
                      className="w-full btn btn-secondary text-sm"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Empty State for Saved Trips */}
        <div className="card text-center py-12">
          <Route className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved trips yet</h2>
          <p className="text-gray-600">Use the AI tools above or start planning your first safe route</p>
        </div>
      </div>
    </div>
  )
}
