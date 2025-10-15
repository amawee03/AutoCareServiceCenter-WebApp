import Appointment from "../models/Appointment.js";
import ServicePackage from "../models/ServicePackage.js";
import JobProgress from "../models/JobProgressModel.js";

import mongoose from "mongoose";

function buildDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

// check if the tiem is available
async function isSlotAvailable(appointmentDate, startTime, endTime, duration) {
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await Appointment.find({
    appointmentDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $ne: "cancelled" }
  });

  const candidateStart = buildDateTime(appointmentDate.toISOString().slice(0,10), startTime);
  const candidateEnd = buildDateTime(appointmentDate.toISOString().slice(0,10), endTime);

  const maxBays = 3;
  let overlappingCount = 0;

  existing.forEach(appt => {
    const apptStart = buildDateTime(appt.appointmentDate.toISOString().slice(0,10), appt.startTime);
    const apptEnd = buildDateTime(appt.appointmentDate.toISOString().slice(0,10), appt.endTime);
    if (candidateStart < apptEnd && candidateEnd > apptStart) {
      overlappingCount++;
    }
  });

  return overlappingCount < maxBays;
}

// Create appointment
export async function createAppointment(req, res) {
  try {
    const { customerId, customerName, vehicle, packageId, servicePackageId, appointmentDate, startTime, notes, payment } = req.body;

    
    const actualPackageId = packageId || servicePackageId;

    if (!customerName || !vehicle || !actualPackageId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!mongoose.isValidObjectId(actualPackageId)) {
      return res.status(400).json({ error: "Invalid service package ID" });
    }

    const service = await ServicePackage.findById(actualPackageId);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const duration = service.duration;
    const endTime = new Date(buildDateTime(appointmentDate, startTime).getTime() + duration * 60000)
      .toTimeString().slice(0, 5);

    // Check 2-hour advance booking requirement for same-day appointments
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const requestDateTime = buildDateTime(appointmentDate, startTime);
    const requestDateOnly = new Date(appointmentDate);
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (requestDateOnly.getTime() === todayDateOnly.getTime() && requestDateTime < twoHoursFromNow) {
      return res.status(400).json({ 
        error: 'Appointments must be booked at least 2 hours in advance for same-day bookings. Please select a time after ' + twoHoursFromNow.toTimeString().substring(0, 5)
      });
    }

    const available = await isSlotAvailable(new Date(appointmentDate), startTime, endTime, duration);
    if (!available) {
      return res.status(409).json({ error: "Time slot not available (all bays occupied)" });
    }

    // Assigning the bay
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23,59,59,999);
    const existing = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: "cancelled" }
    });

    const candidateStart = buildDateTime(appointmentDate, startTime);
    const candidateEnd = buildDateTime(appointmentDate, endTime);
    const occupiedBays = new Set();

    existing.forEach(appt => {
      const apptStart = buildDateTime(appt.appointmentDate.toISOString().slice(0,10), appt.startTime);
      const apptEnd = buildDateTime(appt.appointmentDate.toISOString().slice(0,10), appt.endTime);
      if (candidateStart < apptEnd && candidateEnd > apptStart && appt.bayNumber) {
        occupiedBays.add(appt.bayNumber);
      }
    });

    const freeBay = [1, 2, 3].find(bay => !occupiedBays.has(bay)) || 1;

    const appointment = new Appointment({
      customerId: customerId || null, 
      customerName,
      vehicle,
      packageId: actualPackageId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      duration,
      notes: notes || "",
      bayNumber: freeBay,
      payment: {
        amount: payment?.amount || service.price || 0,
        status: payment?.status || "pending",
        transactionId: payment?.transactionId || "",
        paymentMethod: payment?.paymentMethod || "manual"
      },
      status: "confirmed"
    });

    const saved = await appointment.save();
    await saved.populate("packageId");
    res.status(201).json({ appointment: saved });
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Get all appointments
export async function getAllAppointments(req, res) {
  try {
    const appts = await Appointment.find().populate("packageId").sort({ appointmentDate: 1, startTime: 1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Update payment
export async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid ID" });
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Not found" });
    appt.payment.status = status;
    if (transactionId) appt.payment.transactionId = transactionId;
    if (status === "completed") appt.status = "confirmed";
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}


export async function getCustomerAppointmentsWithProgress(req, res) {
  try {
    const { customerId } = req.params;
    console.log('📊 getCustomerAppointmentsWithProgress called for customerId:', customerId);
    
    if (!mongoose.isValidObjectId(customerId)) {
      console.log('❌ Invalid customer ID:', customerId);
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    // Get all appointments for this customer
    const appointments = await Appointment.find({ customerId })
      .populate("packageId")
      .sort({ appointmentDate: -1, startTime: -1 });
    
    console.log(`✅ Found ${appointments.length} appointments for customer ${customerId}`);

    // Get all job progress records for this customer's appointments
    const appointmentIds = appointments.map(a => a._id.toString());
    console.log('🔍 Looking for jobs with bookingIds:', appointmentIds);
    
    const jobs = await JobProgress.find({ bookingId: { $in: appointmentIds } });
    console.log(`✅ Found ${jobs.length} job progress records`);

    
    const jobMap = {};
    jobs.forEach(job => {
      jobMap[job.bookingId] = job;
      console.log(`📌 Mapped job ${job._id} to bookingId ${job.bookingId}`);
    });

    // Merge appointments with their job progress
    const mergedData = appointments.map(appt => {
      const job = jobMap[appt._id.toString()];
      console.log(`🔗 Appointment ${appt._id}: ${job ? 'HAS JOB' : 'NO JOB'}`);
      
      
      const formattedAppt = {
        _id: appt._id,
        service: appt.packageId?.pkgName || 'Unknown Service',
        vehicle: typeof appt.vehicle === 'object' 
          ? `${appt.vehicle.make || ''} ${appt.vehicle.model || ''} (${appt.vehicle.registration || ''})`.trim()
          : appt.vehicle,
        date: appt.appointmentDate.toLocaleDateString(),
        time: appt.startTime,
        status: appt.status,
        paymentStatus: appt.payment?.status || 'pending',
        paymentAmount: appt.payment?.amount || 0,
        notes: appt.notes,
        bayNumber: appt.bayNumber,
        // Merge job progress data if exists
        jobId: job?._id || null,
        currentStage: job?.currentStage || null,
        progress: job?.progress || 0,
        jobStatus: job?.status || null, // Only set if job exists
        jobNotes: job?.generalNotes || null,
        stages: job?.stages || [],
        jobNotesList: Array.isArray(job?.notes)
          ? job.notes.map(n => ({
              _id: n._id,
              content: n.content,
              author: n.author,
              type: n.type,
              priority: n.priority,
              createdAt: n.createdAt,
              updatedAt: n.updatedAt
            }))
          : [],
      };

      
      if (job && ['check-in', 'in-progress', 'issue'].includes(job.status)) {
        formattedAppt.status = job.status;
      }
      

      return formattedAppt;
    });

    console.log(`📤 Sending ${mergedData.length} merged appointments to frontend`);
    console.log('Sample data:', JSON.stringify(mergedData[0], null, 2));
    
    res.json(mergedData);
  } catch (err) {
    console.error('❌ Error fetching customer appointments with progress:', err);
    res.status(500).json({ error: "Server error" });
  }
}

