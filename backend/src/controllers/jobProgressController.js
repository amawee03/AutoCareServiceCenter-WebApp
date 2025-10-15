import JobProgress from "../models/JobProgressModel.js";
import Appointment from "../models/Appointment.js";
import { getIO } from "../realtime/io.js";

// Get jobs for a specific customer
export const getJobsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Find all appointments for this customer to get their booking IDs
    const appointments = await Appointment.find({ customerId });
    const bookingIds = appointments.map(a => a._id.toString());
    
    // Find all jobs linked to these booking IDs
    const jobs = await JobProgress.find({ 
      bookingId: { $in: bookingIds } 
    });
    
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching customer jobs:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await JobProgress.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await JobProgress.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Check if user is staff or customer
    const userRole = req.session?.user?.role;
    const isStaff = ['finance_manager', 'inventory_manager', 'receptionist', 'service_advisor', 'admin'].includes(userRole);
    
    if (!isStaff) {
      // Customer must own the appointment
      const appointment = await Appointment.findById(job.bookingId);
      if (!appointment || appointment.customerId?.toString() !== req.session.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    res.json(job);
  } catch (err) {
    console.error('Error in getJobById:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const newJob = new JobProgress(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const updatedJob = await JobProgress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await JobProgress.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get active jobs (in-progress, check-in status)
export const getActiveJobs = async (req, res) => {
  try {
    const activeJobs = await JobProgress.find({
      status: { $in: ['check-in', 'in-progress'] }
    }).sort({ updatedAt: -1 });
    res.json(activeJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get job history with date range filtering
export const getJobHistory = async (req, res) => {
  try {
    const { startDate, endDate, status, vehicleReg } = req.query;
    
    let query = {};
    
    // Check if user is staff or customer
    const userRole = req.session?.user?.role;
    const isStaff = ['finance_manager', 'inventory_manager', 'receptionist', 'service_advisor', 'admin'].includes(userRole);
    
    if (!isStaff) {
      // Customer can only see their own jobs
      const appointments = await Appointment.find({ customerId: req.session.userId });
      const bookingIds = appointments.map(a => a._id.toString());
      query.bookingId = { $in: bookingIds };
    }
    
    // Add vehicle registration filter
    if (vehicleReg) {
      query.vehicleReg = vehicleReg;
    }
    
    // Add date range filter - check both createdAt and appointment time
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.$or = [
        {
          createdAt: {
            $gte: start,
            $lte: end
          }
        },
        {
          time: {
            $gte: start,
            $lte: end
          }
        }
      ];
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    const jobs = await JobProgress.find(query)
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent large responses
    
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's stats
    const todaysJobs = await JobProgress.find({
      time: { $gte: startOfDay, $lte: endOfDay }
    });

    const activeJobs = await JobProgress.find({
      status: { $in: ['check-in', 'in-progress'] }
    });

    const completedJobs = await JobProgress.find({
      status: 'completed',
      completedAtDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const flaggedJobs = await JobProgress.find({
      $and: [
        { $or: [ { status: 'issue' }, { hasIssue: true } ] },
        { updatedAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    });

    const stats = {
      todaysTotal: todaysJobs.length,
      activeJobs: activeJobs.length,
      completedToday: completedJobs.length,
      flaggedIssues: flaggedJobs.length,
      completionRate: todaysJobs.length > 0 ? 
        Math.round((completedJobs.length / todaysJobs.length) * 100) : 0
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update job stage/progress
export const updateJobStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStage, progress, notes } = req.body;

    // Get the job first to update stages array
    const job = await JobProgress.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updateData = {};
    if (currentStage) updateData.currentStage = currentStage;
    if (progress !== undefined) updateData.progress = progress;
    if (notes) updateData.generalNotes = notes;

    // Update status based on stage
    if (currentStage === 'completed' || progress === 100) {
      const now = new Date();
      updateData.status = 'completed';
      updateData.completedAt = now.toISOString();
      updateData.completedAtDate = now;
    } else if (currentStage === 'check-in') {
      updateData.status = 'check-in';
    } else if (currentStage && currentStage !== 'completed') {
      updateData.status = 'in-progress';
    }

    // Update the stages array to mark current stage as completed
    if (currentStage && job.stages && job.stages.length > 0) {
      // Check if job has old stage format and update it
      const hasOldStages = job.stages.some(s => 
        ['Service In Progress', 'Quality Check', 'Ready for Pickup'].includes(s.name)
      );
      
      if (hasOldStages) {
        console.log('🔄 Migrating old stages to new format...');
        // Replace with new stages
        job.stages = [
          { name: "Check-in", completed: job.stages[0]?.completed || false },
          { name: "Wash", completed: false },
          { name: "Interior", completed: false },
          { name: "Polishing", completed: false },
          { name: "Inspection", completed: false },
          { name: "Completed", completed: false },
        ];
        console.log('✅ Stages migrated to new format');
      }
      
      // Normalize stage name for comparison
      const normalizedCurrentStage = currentStage.toLowerCase().replace(/\s+/g, '-');
      
      const stageIndex = job.stages.findIndex(s => {
        const normalizedStageName = s.name.toLowerCase().replace(/\s+/g, '-');
        return normalizedStageName === normalizedCurrentStage;
      });
      
      if (stageIndex !== -1) {
        console.log(`📝 Marking stage "${job.stages[stageIndex].name}" as completed`);
        job.stages[stageIndex].completed = true;
        job.stages[stageIndex].completedAt = new Date();
        job.stages[stageIndex].completedBy = req.session?.user?.email || 'Service Advisor';
        if (notes) {
          job.stages[stageIndex].notes = notes;
        }
        updateData.stages = job.stages;
      } else {
        console.log(`⚠️ Stage "${currentStage}" not found in stages array`);
        console.log('Available stages:', job.stages.map(s => s.name));
      }
    }

    if (updateData.currentStage) job.currentStage = updateData.currentStage;
    if (updateData.progress !== undefined) job.progress = updateData.progress;
    if (updateData.generalNotes) job.generalNotes = updateData.generalNotes;
    if (updateData.status) job.status = updateData.status;
    if (updateData.completedAt) job.completedAt = updateData.completedAt;
    if (updateData.completedAtDate) job.completedAtDate = updateData.completedAtDate;
    if (updateData.stages) job.stages = updateData.stages;

    if (updateData.status === 'completed') {
      const pickupMsg = `Your vehicle ${job.vehicleReg || ''} is ready for pickup. Please proceed to the handover desk.`.trim();
      job.notes.push({
        content: pickupMsg,
        author: 'Service Advisor',
        type: 'completion',
        priority: 'low'
      });
    }

    const updatedJob = await job.save();

    console.log(`✅ Updated job ${id} to stage: ${currentStage}`);

    if (updatedJob.bookingId) {
      try {
        const appt = await Appointment.findById(updatedJob.bookingId).select('customerId');
        if (appt?.customerId) {
          const io = getIO();
          if (io) {
            io.to(`customer:${appt.customerId.toString()}`).emit('job:update', {
              bookingId: updatedJob.bookingId,
              jobId: updatedJob._id.toString(),
              status: updatedJob.status,
              currentStage: updatedJob.currentStage,
              progress: updatedJob.progress,
              stages: updatedJob.stages,
              note: updateData.status === 'completed' ? 'Service completed' : undefined
            });
          }
        }
      } catch (e) {}
    }

    if (updateData.status === 'completed' && updatedJob.bookingId) {
      try {
        await Appointment.findByIdAndUpdate(
          updatedJob.bookingId,
          { status: 'completed' },
          { new: true }
        );
        console.log(`✅ Appointment ${updatedJob.bookingId} marked as completed`);
      } catch (appointmentErr) {
        console.error('Error updating appointment status:', appointmentErr);
        // Don't fail the job update if appointment update fails
      }
    }

    res.json(updatedJob);
  } catch (err) {
    console.error('Error in updateJobStage:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add note to job
export const addJobNote = async (req, res) => {
    const { id } = req.params;
    const { content, type, priority, author } = req.body;

    try {
        const job = await JobProgress.findById(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // 1. Create the new note object to push into the array
        const newNote = { content, type, priority, author };
        
        // 2. Push the note into the 'notes' subdocument array (required for history/timeline)
        job.notes.push(newNote);

        // 3. CONDITIONAL LOGIC: Update the 'generalNotes' string field if the type is 'general'
        if (type === 'general') {
            // Note: This assumes you want the LATEST general note content here.
            job.generalNotes = content; 
        }

        // Handle potential bayNumber validation issue if not fixed in schema (as discussed previously)
        if (!job.bayNumber) {
            // Decide on a fallback or ensure required: false in schema
            // For now, let's assume you've set bayNumber: { type: Number } in the schema
        }

        await job.save();

        // The response should return the actual note object that was saved, 
        // which for array pushes is often the last element.
        const addedNote = job.notes[job.notes.length - 1]; 
        res.status(201).json(addedNote);

    } catch (error) {
        console.error('Error adding note to job:', error);
        // Ensure you handle the Mongoose validation error type here
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to add note.' });
    }
};

// Get all notes for a job
export const getJobNotes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await JobProgress.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is staff or customer
    const userRole = req.session?.user?.role;
    const isStaff = ['finance_manager', 'inventory_manager', 'receptionist', 'service_advisor', 'admin'].includes(userRole);
    
    if (!isStaff) {
      // Customer must own the appointment
      const appointment = await Appointment.findById(job.bookingId);
      if (!appointment || appointment.customerId?.toString() !== req.session.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(job.notes);
  } catch (err) {
    console.error('Error in getJobNotes:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update a specific note
export const updateJobNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { content, type, priority } = req.body;

    const job = await JobProgress.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const note = job.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (content) note.content = content;
    if (type) note.type = type;
    if (priority) note.priority = priority;
    note.updatedAt = new Date();

    await job.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a specific note
export const deleteJobNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

    const job = await JobProgress.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const note = job.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.deleteOne();
    await job.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get today's Jobs for job progress dashboard
export async function getTodaysAppointments(req, res) {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(await JobProgress.find({}));


    const jobs = await JobProgress.find({
      time: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ time: 1 });



    // Transform appointments to match the job progress format
    const todaysJobs = jobs.map(job => {
    const appointmentTime = new Date(job.time);
    const timeString = appointmentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
  });

  return {
    id: job._id.toString(),
    customer: job.customerName,
    vehicleNo: job.vehicleReg,
    servicePackage: job.service,
    appointmentTime: timeString,
    status: job.status,
    currentStage: job.currentStage || '-',
    progress: job.progress,
    bayNumber: job.bayNumber,
    notes: job.generalNotes || '',
    duration: job.duration || null
  };
});


    res.status(200).json(todaysJobs);
  } catch (error) {
    console.error("Error in getTodaysAppointments controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get job history for a specific vehicle registration
// Add this new function to JobProgressController.js

// Get job history for a specific vehicle registration
export const getJobHistoryByVehicleReg = async (req, res) => {
    try {
        // Get the vehicle registration from the query parameters
        const { vehicleReg } = req.query; 

        if (!vehicleReg) {
            return res.status(400).json({ error: 'Vehicle registration is required.' });
        }

        // Find all jobs matching the vehicleReg, but exclude active jobs
        const history = await JobProgress.find({ 
            vehicleReg: vehicleReg,
            // Only retrieve jobs that are completed or flagged, not active ones
            status: { $nin: ['scheduled', 'check-in', 'in-progress'] } 
        })
        .sort({ time: -1 }); // Sort by newest first

        res.json(history);
    } catch (err) {
        console.error("Error fetching vehicle history:", err.message);
        res.status(500).json({ error: 'Server error fetching history.' });
    }
};