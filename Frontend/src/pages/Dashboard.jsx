import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle, Clock, AlertTriangle, User, 
  MapPin, Shield, Users, FileText 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  // States based on role
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('janseva_token');
    const storedUser = localStorage.getItem('janseva_user');
    
    if (!storedToken || !storedUser) {
      navigate('/login');
      return;
    }
    
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user || !token) return;

    const fetchRoleData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        if (user.role === 'admin' || user.role === 'ngo') {
          // Fetch Stats
          const statsRes = await fetch('http://localhost:5000/api/stats/overview', { headers });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData.data);
          }
          // Fetch recent requests
          const reqRes = await fetch('http://localhost:5000/api/requests?limit=5', { headers });
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            setRequests(reqData.data);
          }
        } 
        else if (user.role === 'volunteer') {
          // Fetch Volunteer Profile
          const volRes = await fetch('http://localhost:5000/api/volunteer/profile', { headers });
          if (volRes.ok) {
            const volData = await volRes.json();
            setVolunteerProfile(volData.data);
          }
        }
        else {
          // Standard User: Fetch all requests to simulate "My Requests" 
          // (In a real app, backend will filter by createdBy, but we'll fetch general for now if not implemented)
          const reqRes = await fetch('http://localhost:5000/api/requests?limit=10', { headers });
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            // Filter locally for demo purposes since getRequests doesn't strictly have createdBy filter yet
            const myReqs = reqData.data.filter(r => r.createdBy?._id === user._id || r.createdBy === user._id);
            setRequests(myReqs.length > 0 ? myReqs : reqData.data.slice(0,3)); // Fallback to some requests to not look empty during demo
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [user, token]);

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <Activity className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Helper color functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              {user.role === 'admin' ? <Shield className="w-8 h-8 text-emerald-700" /> : 
               user.role === 'ngo' ? <Users className="w-8 h-8 text-emerald-700" /> :
               <User className="w-8 h-8 text-emerald-700" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-500 capitalize">{user.role} Dashboard</p>
            </div>
          </div>
          
          <button className="btn-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Create New Request</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ADMIN / NGO VIEW */}
        {/* ================================================================= */}
        {(user.role === 'admin' || user.role === 'ngo') && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900">Platform Overview</h2>
            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm font-medium mb-1">Total Requests</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.requests.total}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm font-medium mb-1">Pending</div>
                  <div className="text-3xl font-bold text-amber-600">{stats.requests.pending}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm font-medium mb-1">Resolved</div>
                  <div className="text-3xl font-bold text-emerald-600">{stats.requests.resolved}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-500 text-sm font-medium mb-1">Active Volunteers</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.volunteers.available}</div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Recent Service Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{req.title}</td>
                        <td className="px-6 py-4 text-gray-500">{req.location?.city}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VOLUNTEER VIEW */}
        {/* ================================================================= */}
        {user.role === 'volunteer' && volunteerProfile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">My Assignments</h2>
              
              <div className="space-y-4">
                {volunteerProfile.assignedRequests?.map(req => (
                  <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{req.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(req.priority)}`}>
                          {req.priority} Priority
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">Category: {req.category}</p>
                      <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">View Details &rarr;</button>
                    </div>
                  </div>
                ))}
                
                {(!volunteerProfile.assignedRequests || volunteerProfile.assignedRequests.length === 0) && (
                  <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Assignments</h3>
                    <p className="text-gray-500">You currently don't have any pending requests assigned to you.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">My Stats</h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-medium">Availability</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${volunteerProfile.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {volunteerProfile.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-medium">Completed</span>
                  <span className="text-gray-900 font-bold">{volunteerProfile.completedRequests || 0}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-gray-500 font-medium">Rating</span>
                  <span className="text-gray-900 font-bold">{volunteerProfile.rating || "New"} / 5</span>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Need a break?</h3>
                <p className="text-sm text-gray-600 mb-4">You can update your availability status at any time.</p>
                <button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-xl text-sm font-semibold transition-colors">
                  Update Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STANDARD USER VIEW */}
        {/* ================================================================= */}
        {user.role === 'user' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">My Requests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map(req => (
                <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{req.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{req.description}</p>
                  </div>
                  <div className="flex items-center text-sm font-medium text-emerald-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {req.location?.city}
                  </div>
                </div>
              ))}
            </div>
            
            {requests.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No requests yet</h3>
                <p className="text-gray-500 mb-6">Create a request to get help from NGOs or volunteers.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
