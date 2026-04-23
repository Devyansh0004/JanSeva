import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, IndianRupee, MapPin, Activity, Info, Database } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function CampaignDetails() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assignments')
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('janseva_token')
        const res = await fetch(`${API}/campaigns/ngo/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (json.success) setData(json.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  if (loading) return <div className="p-12 text-center text-gray-500 font-bold">Loading Campaign Data...</div>
  if (!data) return <div className="p-12 text-center text-red-500 font-bold">Campaign not found</div>

  const { campaign, assignments, rawSurvey, registeredVolunteers } = data;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container py-8">
        <Link to="/dashboard" className="text-blue-600 font-bold text-sm mb-6 inline-flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-2xl p-8 border shadow-sm mb-8 relative overflow-hidden">
          {campaign.isEmergency && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">EMERGENCY MISSION</div>}
          <div className="flex gap-4 items-start mb-6">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-700">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold mb-2">{campaign.title}</h1>
              <p className="text-gray-600 max-w-3xl leading-relaxed">{campaign.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border">
            <div className="text-center p-2">
              <p className="text-sm text-gray-500 font-bold mb-1">Target Funds</p>
              <p className="text-2xl font-black text-purple-600">₹{campaign.targetAmount?.toLocaleString() || 0}</p>
            </div>
            <div className="text-center p-2">
              <p className="text-sm text-gray-500 font-bold mb-1">Total Villages Aided</p>
              <p className="text-2xl font-black text-blue-600">{assignments.length}</p>
            </div>
            <div className="text-center p-2">
              <p className="text-sm text-gray-500 font-bold mb-1">Total Volunteers</p>
              <p className="text-2xl font-black text-green-600">{assignments.reduce((sum, a) => sum + (a.volunteers_assigned?.length || 0), 0)}</p>
            </div>
            <div className="text-center p-2">
              <p className="text-sm text-gray-500 font-bold mb-1">End Date</p>
              <p className="text-2xl font-black text-gray-700">{new Date(campaign.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b pb-2">
          <button 
            className={`font-bold pb-2 border-b-2 flex items-center gap-2 px-2 transition ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('assignments')}
          >
            <MapPin size={18} /> Assignment Report
          </button>
          <button 
            className={`font-bold pb-2 border-b-2 flex items-center gap-2 px-2 transition ${activeTab === 'raw_data' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('raw_data')}
          >
            <Database size={18} /> Raw Survey Data
          </button>
          <button 
            className={`font-bold pb-2 border-b-2 flex items-center gap-2 px-2 transition ${activeTab === 'volunteers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('volunteers')}
          >
            <Users size={18} /> Registered Volunteers
          </button>
        </div>

        {activeTab === 'assignments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                Detailed Allocation Report
              </h2>
              <button onClick={() => setShowExplanation(!showExplanation)} className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline">
                <Info size={16} /> How are priority scores & funds calculated?
              </button>
            </div>

            {showExplanation && (
              <div className="mb-6 bg-blue-50 border border-blue-200 p-6 rounded-xl text-sm text-blue-900 leading-relaxed">
                <h3 className="font-bold text-lg mb-2">Algorithm Explanation</h3>
                <p className="mb-3">Our system evaluates the raw CSV survey data exclusively for the domains you selected. It calculates a <strong>Priority Score (0-100)</strong> where a higher score indicates greater urgency.</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li><strong>Medical Score:</strong> Heavily weighted by Infant Mortality (30%) and Malnutrition (25%), alongside vaccination coverage and hospital access.</li>
                  <li><strong>Food Score:</strong> Weighted by Food Insecurity (35%), Avg Meals (30%), and Water Access (15%).</li>
                  <li><strong>Education Score:</strong> Driven by School Enrollment (30%), Literacy Rate (25%), and Teacher Ratio.</li>
                  <li><strong>Shelter Score:</strong> Driven by Homelessness (30%), Sanitation (20%), and Disaster Affection (20%).</li>
                </ul>
                <p><strong>Fund Allocation:</strong> We calculate the total sum of the Priority Scores for all your selected villages. The funds are then distributed mathematically proportional to a village's score divided by the global total score.</p>
                <p><strong>Volunteer Teams:</strong> Highly prioritized villages receive the most volunteers. Volunteers are distributed using an interleaved rank system to ensure every village receives a diverse mix of senior (highly experienced) and junior volunteers!</p>
              </div>
            )}

            {assignments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-gray-500">
                No villages were assigned. The survey data might have been empty or invalid.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider border-b">
                        <th className="p-4 font-bold">Village</th>
                        <th className="p-4 font-bold">Domain</th>
                        <th className="p-4 font-bold text-center">Priority Score</th>
                        <th className="p-4 font-bold text-center">Funds Allocated</th>
                        <th className="p-4 font-bold">Assigned Volunteer Diversity Team</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {assignments.map((assignment, idx) => (
                        <tr key={assignment._id || idx} className="hover:bg-blue-50/50 transition">
                          <td className="p-4 align-top">
                            <p className="font-bold text-gray-900 text-lg">{assignment.village_name}</p>
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-2 py-1 rounded mt-1">{assignment.village_id}</p>
                          </td>
                          <td className="p-4 align-top">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                              {assignment.domain}
                            </span>
                          </td>
                          <td className="p-4 align-top text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-700 font-black text-lg border-2 border-red-200">
                              {Math.round(assignment.domain_score)}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Rank #{assignment.priority_rank}</p>
                          </td>
                          <td className="p-4 align-top text-center">
                            <p className="text-xl font-bold text-purple-700 flex items-center justify-center gap-1">
                              <IndianRupee size={16} />
                              {/* Fallback to 0 if the campaign was created before funds_assigned was implemented */}
                              {assignment.funds_assigned != null ? assignment.funds_assigned.toLocaleString() : '0'}
                            </p>
                          </td>
                          <td className="p-4 align-top">
                            {assignment.volunteerDetails?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {assignment.volunteerDetails.map((vol, vidx) => (
                                  <div key={vidx} className="bg-white border shadow-sm rounded-lg p-2 text-sm flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center font-bold">
                                      {vol.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold leading-tight">{vol.name}</p>
                                      <p className="text-xs text-gray-500">{vol.hours} hrs exp</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No volunteers assigned.</p>
                            )}
                            {assignment.group_id && (
                              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                <Users size={12} /> Group ID: {assignment.group_id}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'raw_data' && (
          <div>
            <h2 className="text-2xl font-extrabold mb-4">Survey Data Uploaded</h2>
            {!rawSurvey || rawSurvey.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-gray-500">
                No raw survey data found for this campaign.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-800 text-gray-100 uppercase tracking-wider text-xs">
                      <th className="p-3 border-r border-gray-700">Village ID</th>
                      <th className="p-3 border-r border-gray-700">Name</th>
                      <th className="p-3 border-r border-gray-700">District</th>
                      <th className="p-3 border-r border-gray-700 text-right">Population</th>
                      <th className="p-3 border-r border-gray-700 text-right">Overall Score</th>
                      <th className="p-3 border-r border-gray-700 text-right">Med Score</th>
                      <th className="p-3 border-r border-gray-700 text-right">Food Score</th>
                      <th className="p-3 border-r border-gray-700 text-right">Edu Score</th>
                      <th className="p-3 border-r border-gray-700 text-right">Shelter Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rawSurvey.map((village, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 border-r font-mono">{village.village_id}</td>
                        <td className="p-3 border-r font-bold">{village.village_name}</td>
                        <td className="p-3 border-r">{village.district}, {village.state}</td>
                        <td className="p-3 border-r text-right font-mono">{village.population}</td>
                        <td className="p-3 border-r text-right font-bold text-blue-600">{village.overall_priority_score?.toFixed(1) || 'N/A'}</td>
                        <td className="p-3 border-r text-right text-red-600">{village.medical?.score?.toFixed(1) || 'N/A'}</td>
                        <td className="p-3 border-r text-right text-orange-600">{village.food?.score?.toFixed(1) || 'N/A'}</td>
                        <td className="p-3 border-r text-right text-green-600">{village.education?.score?.toFixed(1) || 'N/A'}</td>
                        <td className="p-3 border-r text-right text-purple-600">{village.shelter?.score?.toFixed(1) || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div>
            <h2 className="text-2xl font-extrabold mb-4">Registered Volunteers</h2>
            {!registeredVolunteers || registeredVolunteers.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-gray-500">
                No volunteers have registered for this campaign yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-gray-100 uppercase tracking-wider text-xs">
                      <th className="p-4 border-r border-gray-700">Name</th>
                      <th className="p-4 border-r border-gray-700">Email</th>
                      <th className="p-4 border-r border-gray-700 text-center">Hours</th>
                      <th className="p-4">Primary Domains</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registeredVolunteers.map((vol, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-4 border-r font-bold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center font-bold">
                            {vol.name.charAt(0)}
                          </div>
                          {vol.name}
                        </td>
                        <td className="p-4 border-r text-gray-600">{vol.email}</td>
                        <td className="p-4 border-r text-center font-mono font-bold text-blue-600">{vol.hours}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {vol.domains && vol.domains.length > 0 ? (
                              vol.domains.map((d, dIdx) => (
                                <span key={dIdx} className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase">
                                  {d}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">No domains</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
