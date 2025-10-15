import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, FlagIcon, ClockIcon, AlertTriangleIcon, CheckIcon, PlusIcon, EditIcon, TrashIcon, MessageSquareIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom'; 
import { useNavigate } from "react-router-dom";
import apiClient from '../../../api/axios';

// Service stages
const serviceStages = [
  { id: 'check-in', label: 'Check-in' },
  { id: 'wash', label: 'Wash' },
  { id: 'interior', label: 'Interior' },
  { id: 'polishing', label: 'Polishing' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'completed', label: 'Completed' },
];

// Job timeline will be built from job stages
const buildTimeline = (job) => {
  if (!job || !job.stages) return [];
  
  return job.stages
    .filter(stage => stage.completed)
    .map(stage => ({
      stage: stage.name.toLowerCase().replace(/\s+/g, '-'),
      timestamp: stage.completedAt ? new Date(stage.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      user: stage.completedBy || 'Service Advisor',
      notes: stage.notes || `${stage.name} completed`
    }));
};

export default function JobDetails({ job: propJob, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialJob = location.state?.job || propJob || null;

  const jobId = initialJob?._id || initialJob?.id; 

  // Add state to store the current job data
  const [job, setJob] = useState(initialJob);
  const [currentStage, setCurrentStage] = useState(initialJob?.currentStage?.toLowerCase() || 'check-in');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);
  
  // Note management state
  const [notes, setNotes] = useState([]);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general',
    priority: 'low'
  });
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Vehicle handover state
  const [handover, setHandover] = useState({ nic: '', name: '', phone: '' });
  const [savingHandover, setSavingHandover] = useState(false);
  const [handoverEditable, setHandoverEditable] = useState(false);

  // Fetch job details
  const fetchJobDetails = async () => {
    try {
      const response = await apiClient.get(`/api/jobs/${jobId}`);
      setJob(response.data);
      console.log('✅ Job details refreshed:', response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  // Load notes and job details when component mounts
  useEffect(() => {
    if (jobId) {
      fetchNotes();
      fetchJobDetails();
    }
  }, [jobId]);

  // Sync handover form with loaded job data
  useEffect(() => {
    if (job && job.handover) {
      setHandover({
        nic: job.handover.nic || '',
        name: job.handover.name || '',
        phone: job.handover.phone || ''
      });
      setHandoverEditable(false);
    } else if (job) {
      // If no handover yet, allow immediate editing to add
      setHandoverEditable(true);
    }
  }, [job]);

  const validateNIC = (v) => /^\d{12}$/.test(v);
  const validatePhone = (v) => /^\d{10}$/.test(v);

  const handleSaveHandover = async (e) => {
    e.preventDefault();
    if (!handover.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!validateNIC(handover.nic)) {
      alert('NIC must be exactly 12 digits');
      return;
    }
    if (!validatePhone(handover.phone)) {
      alert('Phone must be exactly 10 digits');
      return;
    }
    try {
      setSavingHandover(true);
      await apiClient.put(`/api/jobs/${jobId}`, { handover });
      await fetchJobDetails();
      alert('Handover details saved');
    } catch (error) {
      console.error('Error saving handover:', error);
      alert('Failed to save handover details');
    } finally {
      setSavingHandover(false);
    }
  };

  // Fetch notes for the job
  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await apiClient.get(`/api/jobs/${jobId}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Add new note
  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/api/jobs/${jobId}/notes`, {
        ...newNote,
        author: 'Service Advisor' // In a real app, this would come from user context
      });

      setNotes([response.data, ...notes]);
      setNewNote({ content: '', type: 'general', priority: 'low' });
      setShowAddNoteModal(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Update existing note
  const handleUpdateNote = async (noteId, updatedData) => {
    try {
      const response = await apiClient.put(`/api/jobs/${jobId}/notes/${noteId}`, updatedData);
      setNotes(notes.map(note => note._id === noteId ? response.data : note));
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await apiClient.delete(`/api/jobs/${jobId}/notes/${noteId}`);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const currentIndex = serviceStages.findIndex(stage => stage.id === currentStage);
    return Math.round(((currentIndex + 1) / serviceStages.length) * 100);
  };

  // Update stage
  const handleStageUpdate = async (newStage) => {
    try {
      console.log(`🔄 Updating stage to: ${newStage}`);
      await apiClient.put(`/api/jobs/${jobId}/stage`, {
        currentStage: newStage,
        progress: calculateProgressForStage(newStage)
      });
      setCurrentStage(newStage);
      
      // Refresh job data to get updated stages array
      console.log('🔄 Refreshing job details to update timeline...');
      await fetchJobDetails();
      console.log('✅ Timeline should now be updated');
    } catch (error) {
      console.error('Error updating job stage:', error);
    }
  };

  // Calculate progress percentage for a given stage
  const calculateProgressForStage = (stage) => {
    const currentIndex = serviceStages.findIndex(s => s.id === stage);
    return Math.round(((currentIndex + 1) / serviceStages.length) * 100);
  };

  // Flag issue
  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add issue note first
      await apiClient.post(`/api/jobs/${jobId}/notes`, {
        content: issueDescription,
        type: 'issue',
        priority: 'high',
        author: 'Service Advisor'
      });
      
      // Update job to mark it as having an issue
      // We'll use the update endpoint to set a flag
      await apiClient.put(`/api/jobs/${jobId}`, {
        hasIssue: true,
        issueDescription: issueDescription
      });
      
      setFlagSuccess(true);
      
      // Refresh notes to show the new issue
      fetchNotes();
      
      setTimeout(() => {
        setShowFlagModal(false);
        setFlagSuccess(false);
        setIssueDescription('');
        // Notify parent to refresh stats
        if (window.location.pathname.includes('service-advisor')) {
          window.location.reload(); // Refresh to update stats
        }
      }, 2000);
    } catch (error) {
      console.error('Error flagging issue:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to flag issue. Please try again.');
    }
  };

  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>No job selected. Please select a job to view details.</p>
        <button onClick={onBack} className="mt-4 flex items-center text-red-600 hover:text-red-800">
          <ArrowLeftIcon size={16} className="mr-1" /> Back to jobs
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <button onClick={onBack ? onBack : () => navigate(-1)}  className="mr-3 p-1 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Job Details - {job.id && `JOB-${job.id.slice(-6).toUpperCase()}`}</h2>
          <button onClick={() => setShowFlagModal(true)} className="ml-auto flex items-center text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded-md">
            <FlagIcon size={16} className="mr-1" />
            Flag Issue
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Customer & Vehicle Info */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm uppercase text-gray-500 mb-2">Customer Information</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{job.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{job.customerPhone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Booking ID</div>
                  <div className="font-medium">{job.bookingId}</div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm uppercase text-gray-500 mb-2">Vehicle Information</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Registration</div>
                  <div className="font-medium">{job.vehicleReg}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Make & Model</div>
                  <div className="font-medium">{job.vehicleMake}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Service Package</div>
                  <div className="font-medium">{job.service}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Progress */}
          <div className="col-span-1 border rounded-lg p-4">
            <h3 className="text-sm uppercase text-gray-500 mb-2">Service Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-red-600" style={{ width: `${calculateProgress()}%` }}></div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Update Service Stage</label>
              <select value={currentStage} onChange={e => handleStageUpdate(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500">
                {serviceStages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
            </div>

            <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors" onClick={() => handleStageUpdate(currentStage)}>
              Update Stage
            </button>
          </div>
        </div>

        {/* Service Timeline */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Service Timeline</h3>
          <div className="relative">
            {buildTimeline(job).length > 0 ? (
              buildTimeline(job).map((event, index) => {
                // Use green for completed stage, red for others
                const isCompleted = event.stage === 'completed';
                const bgColor = isCompleted ? 'bg-green-600' : 'bg-red-600';
                const Icon = isCompleted ? CheckIcon : ClockIcon;
                
                return (
                  <div key={index} className="mb-6 ml-6">
                    <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${bgColor} text-white`}>
                      <Icon size={16} />
                    </span>
                    <div className="ml-2">
                      <h4 className="font-medium">{serviceStages.find(s => s.id === event.stage)?.label || event.stage}</h4>
                      <time className="block text-sm text-gray-500">{event.timestamp} - {event.user}</time>
                      <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>No timeline events yet. Update the service stage to begin tracking.</p>
              </div>
            )}

            {currentStage === 'completed' && (
              <div className="mb-6 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white bg-green-600 text-white">
                  <CheckIcon size={16} />
                </span>
                <div className="ml-2">
                  <h4 className="font-medium">Service Completed</h4>
                  <time className="block text-sm text-gray-500">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Handover Section */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Vehicle Handover</h3>
        <form onSubmit={handleSaveHandover} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">NIC (12 digits)</label>
            <input
              type="text"
              value={handover.nic}
              onChange={(e) => setHandover({ ...handover, nic: e.target.value.replace(/[^0-9]/g, '').slice(0,12) })}
              disabled={!handoverEditable}
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500 ${handoverEditable ? 'border-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
              placeholder="e.g. 199912345678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={handover.name}
              onChange={(e) => setHandover({ ...handover, name: e.target.value })}
              disabled={!handoverEditable}
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500 ${handoverEditable ? 'border-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (10 digits)</label>
            <input
              type="text"
              value={handover.phone}
              onChange={(e) => setHandover({ ...handover, phone: e.target.value.replace(/[^0-9]/g, '').slice(0,10) })}
              disabled={!handoverEditable}
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500 ${handoverEditable ? 'border-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
              placeholder="07XXXXXXXX"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHandoverEditable(true)}
              disabled={handoverEditable}
              className={`px-4 py-2 rounded-md border ${handoverEditable ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              Edit
            </button>
            <button
              type="submit"
              disabled={savingHandover || !handoverEditable}
              className={`px-4 py-2 rounded-md text-white ${savingHandover || !handoverEditable ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {savingHandover ? 'Saving...' : 'Save'}
            </button>
            {handoverEditable && (
              <button
                type="button"
                onClick={() => {
                  // revert changes
                  if (job && job.handover) {
                    setHandover({
                      nic: job.handover.nic || '',
                      name: job.handover.name || '',
                      phone: job.handover.phone || ''
                    });
                  }
                  setHandoverEditable(false);
                }}
                className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {job?.handover?.recordedAt && (
          <div className="text-sm text-gray-500 mt-2">
            Last recorded at {new Date(job.handover.recordedAt).toLocaleString()} {job.handover.recordedBy ? `by ${job.handover.recordedBy}` : ''}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <MessageSquareIcon size={20} className="mr-2" />
            Job Notes ({notes.length})
          </h3>
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon size={16} className="mr-1" />
            Add Note
          </button>
        </div>

        {loadingNotes ? (
          <div className="text-center py-4 text-gray-500">Loading notes...</div>
        ) : notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                {editingNote && editingNote._id === note._id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateNote(note._id, {
                      content: editingNote.content,
                      type: editingNote.type,
                      priority: editingNote.priority
                    });
                  }}>
                    <div className="mb-3">
                      <textarea
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                        className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter note content..."
                        required
                      />
                    </div>
                    <div className="flex gap-2 mb-3">
                      <select
                        value={editingNote.type}
                        onChange={(e) => setEditingNote({...editingNote, type: e.target.value})}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="general">General</option>
                        <option value="issue">Issue</option>
                        <option value="update">Update</option>
                        <option value="completion">Completion</option>
                      </select>
                      <select
                        value={editingNote.priority}
                        onChange={(e) => setEditingNote({...editingNote, priority: e.target.value})}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingNote(null)} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          note.type === 'issue' ? 'bg-red-100 text-red-800 border border-red-300' :
                          note.type === 'update' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          note.type === 'completion' ? 'bg-green-100 text-green-800 border border-green-300' :
                          'bg-gray-200 text-gray-800 border border-gray-300'
                        }`}>
                          {note.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          note.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-300' :
                          note.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {note.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingNote(note)}
                          className="p-2 rounded-md text-gray-600 hover:text-white hover:bg-blue-600 transition-colors border border-gray-300 hover:border-blue-600"
                          title="Edit note"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="p-2 rounded-md text-gray-600 hover:text-white hover:bg-red-600 transition-colors border border-gray-300 hover:border-red-600"
                          title="Delete note"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{note.content}</p>
                    <div className="text-sm text-gray-500">
                      By {note.author} • {new Date(note.createdAt).toLocaleString()}
                      {note.updatedAt !== note.createdAt && (
                        <span> • Updated {new Date(note.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquareIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No notes yet. Add the first note to track important details about this job.</p>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center">
              <MessageSquareIcon size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-medium">Add New Note</h3>
            </div>

            <form onSubmit={handleAddNote} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Note Content</label>
                <textarea
                  required
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your note here..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newNote.type}
                    onChange={(e) => setNewNote({...newNote, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="issue">Issue</option>
                    <option value="update">Update</option>
                    <option value="completion">Completion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newNote.priority}
                    onChange={(e) => setNewNote({...newNote, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setNewNote({ content: '', type: 'general', priority: 'low' });
                  }} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag Issue Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center">
              <AlertTriangleIcon size={20} className="text-red-600 mr-2" />
              <h3 className="text-lg font-medium">Flag an Issue</h3>
            </div>

            <form onSubmit={handleFlagSubmit} className="p-4">
              {flagSuccess ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                  <CheckIcon size={16} className="mr-2" />
                  Issue has been flagged successfully!
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Issue Description</label>
                    <textarea
                      required
                      value={issueDescription}
                      onChange={e => setIssueDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="Describe the issue that needs attention..."
                    ></textarea>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex items-start">
                      <AlertTriangleIcon size={16} className="text-yellow-400 mr-2 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        Flagged issues will be sent to the admin for resolution. You will be notified once resolved.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowFlagModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                {!flagSuccess && (
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Submit Issue
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}