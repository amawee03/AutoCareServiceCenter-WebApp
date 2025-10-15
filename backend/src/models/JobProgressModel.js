// JobProgressModel.js
import mongoose from 'mongoose';

const handoverSchema = new mongoose.Schema({
  nic: { type: String, match: /^\d{12}$/ },
  name: { type: String },
  phone: { type: String, match: /^\d{10}$/ },
  recordedAt: { type: Date, default: Date.now },
  recordedBy: { type: String }
}, { _id: false });

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  time: { type: String },
  completedAt: { type: Date },
  completedBy: { type: String },
  notes: { type: String }
});

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
  type: { type: String, enum: ['general', 'issue', 'update', 'completion'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String }, // Missing from Appointment schema
  vehicleMake: { type: String, required: true },
  vehicleReg: { type: String, required: true }, // Missing from Appointment schema
  service: { type: String, required: true },
  time: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'check-in', 'in-progress', 'completed', 'issue'], default: 'scheduled' },
  currentStage: { type: String },
  progress: { type: Number, default: 0 },
  completedAt: { type: Date },
  stages: [stageSchema],
  notes: [noteSchema],
  generalNotes: { type: String },
  bayNumber: { type: Number },
  hasIssue: { type: Boolean, default: false },
  issueDescription: { type: String },
  handover: handoverSchema,
}, {
  timestamps: true
});

const JobProgress = mongoose.model('JobProgress', jobSchema);

export default JobProgress;