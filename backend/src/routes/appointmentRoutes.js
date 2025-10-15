// src/routes/appointmentRoutes.js
import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import ServicePackage from "../models/ServicePackage.js";
import { updatePastAppointments } from "../utils/appointmentScheduler.js";

const router = express.Router();


async function populateVehicleDetails(appointments) {
  const Vehicle = mongoose.model('Vehicle');
  
  for (let appt of appointments) {
    
    if (typeof appt.vehicle === 'string' && mongoose.Types.ObjectId.isValid(appt.vehicle)) {
      try {
        const vehicleDoc = await Vehicle.findById(appt.vehicle);
        if (vehicleDoc) {
          appt.vehicle = {
            make: vehicleDoc.make,
            model: vehicleDoc.model,
            year: vehicleDoc.year,
            licensePlate: vehicleDoc.licensePlate,
            registration: vehicleDoc.licensePlate
          };
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
      }
    }
  }
  
  return appointments;
}


router.get('/available-time-slots', async (req, res) => {
  try {
    const { packageId, date } = req.query;
    if (!packageId || !date) return res.status(400).json({ error: 'packageId and date required' });
    if (!mongoose.Types.ObjectId.isValid(packageId)) return res.status(400).json({ error: 'Invalid packageId' });

    const service = await ServicePackage.findById(packageId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const requestDate = new Date(date);
    if (isNaN(requestDate)) return res.status(400).json({ error: 'Invalid date format' });

    
    const startHour = 8;
    const endHour = 18;
    const interval = 30; 
    const maxBays = 3;
    const duration = service.duration || 60;

    
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);
        const dayEnd = new Date(`${date}T${endHour}:00:00`);
        if (slotEnd <= dayEnd) {
          slots.push({ start: slotStart, end: slotEnd, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
        }
      }
    }

    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });


    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const isToday = requestDate.toDateString() === now.toDateString();

    const available = [];
    for (const slot of slots) {
      // Skip slots that are less than 2 hours from now if booking for today
      if (isToday && slot.start < twoHoursFromNow) {
        continue;
      }

      let overlapCount = 0;
      for (const appt of existing) {
        const apptStart = new Date(`${date}T${appt.startTime}:00`);
        const apptEnd = new Date(apptStart.getTime() + (appt.duration || duration) * 60000);
        if (slot.start < apptEnd && slot.end > apptStart) {
          overlapCount++;
        }
      }
      if (overlapCount < maxBays) {
        available.push(slot.time);
      }
    }

    res.json({ date, packageId, availableSlots: available });
  } catch (err) {
    console.error("Slot error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/check-instant-availability', async (req, res) => {
  try {
    const { packageId, appointmentDate, startTime, duration } = req.body;
    
    if (!packageId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'packageId, appointmentDate, and startTime required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ error: 'Invalid packageId' });
    }

    const service = await ServicePackage.findById(packageId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const requestDateTime = new Date(`${appointmentDate}T${startTime}:00`);
    const serviceDuration = duration || service.duration || 60;
    const endDateTime = new Date(requestDateTime.getTime() + serviceDuration * 60000);

    // Check 2-hour advance booking requirement for same-day appointments
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const requestDateOnly = new Date(appointmentDate);
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (requestDateOnly.getTime() === todayDateOnly.getTime() && requestDateTime < twoHoursFromNow) {
      return res.status(400).json({ 
        available: false,
        error: 'Appointments must be booked at least 2 hours in advance for same-day bookings',
        minimumTime: twoHoursFromNow.toTimeString().substring(0, 5)
      });
    }

    // Check for conflicts
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    let overlapCount = 0;
    const occupiedBays = [];

    for (const appt of existing) {
      const apptStart = new Date(`${appt.appointmentDate.toISOString().split('T')[0]}T${appt.startTime}:00`);
      const apptEnd = new Date(apptStart.getTime() + (appt.duration || serviceDuration) * 60000);

      if (requestDateTime < apptEnd && endDateTime > apptStart) {
        overlapCount++;
        if (appt.bayNumber) occupiedBays.push(appt.bayNumber);
      }
    }

    const maxBays = 3;
    const isAvailable = overlapCount < maxBays;
    const availableBay = isAvailable ? [1, 2, 3].find(b => !occupiedBays.includes(b)) : null;

    res.json({
      available: isAvailable,
      bayNumber: availableBay,
      occupiedBays: occupiedBays,
      totalConflicts: overlapCount
    });

  } catch (err) {
    console.error('Check availability error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    let appts = await Appointment.find()
      .populate('packageId', 'pkgName')
      .sort({ appointmentDate: 1 });
    
    // Convert to plain objects and populate vehicle details
    appts = appts.map(a => a.toObject());
    appts = await populateVehicleDetails(appts);
    
    res.json(appts);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/calendar', async (req, res) => {
  try {
   
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    let appts = await Appointment.find({
      appointmentDate: { $gte: startOfToday }, 
      status: { $ne: 'cancelled' }
    })
      .populate('packageId', 'pkgName category duration')
      .sort({ appointmentDate: 1, startTime: 1 });
    
    
    let transformedAppts = appts.map(appt => ({
      ...appt.toObject(),
      preferredTime: new Date(`${appt.appointmentDate.toISOString().split('T')[0]}T${appt.startTime}:00`),
      selectedService: appt.packageId
    }));
    
    
    transformedAppts = await populateVehicleDetails(transformedAppts);
    
    res.json(transformedAppts);
  } catch (err) {
    console.error('Calendar fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const appointments = await Appointment.find({ customerId })
      .populate('packageId', 'pkgName category duration price')
      .sort({ appointmentDate: -1, startTime: -1 });
    
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching customer appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/customer/:customerId/with-progress', async (req, res) => {
  try {
    const { getCustomerAppointmentsWithProgress } = await import('../controllers/appointmentController.js');
    return getCustomerAppointmentsWithProgress(req, res);
  } catch (err) {
    console.error('Error loading controller:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('packageId');
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/admin-booking', async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerAddress,
      vehicle, 
      packageId, 
      preferredTime,
      duration,
      notes,
      servicePackage
    } = req.body;


    if (!customerName || !customerPhone || !vehicle || !packageId || !preferredTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ error: 'Invalid packageId' });
    }

    const service = await ServicePackage.findById(packageId);
    if (!service) return res.status(404).json({ error: 'Service package not found' });

  
    const appointmentDateTime = new Date(preferredTime);
    const appointmentDate = appointmentDateTime.toISOString().split('T')[0];
    const startTime = appointmentDateTime.toTimeString().substring(0, 5);

    // Check 2-hour advance booking requirement for same-day appointments
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const requestDateOnly = new Date(appointmentDate);
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (requestDateOnly.getTime() === todayDateOnly.getTime() && appointmentDateTime < twoHoursFromNow) {
      return res.status(400).json({ 
        error: 'Appointments must be booked at least 2 hours in advance for same-day bookings. Please select a time after ' + twoHoursFromNow.toTimeString().substring(0, 5)
      });
    }
    
 
    const serviceDuration = duration || service.duration || 60;
    const endDateTime = new Date(appointmentDateTime.getTime() + serviceDuration * 60000);
    const endTime = endDateTime.toTimeString().substring(0, 5);


    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const maxBays = 3;
    let overlapCount = 0;
    const occupiedBays = [];

    for (const appt of existingAppointments) {
      const apptStart = new Date(`${appt.appointmentDate.toISOString().split('T')[0]}T${appt.startTime}:00`);
      const apptEnd = new Date(apptStart.getTime() + (appt.duration || serviceDuration) * 60000);

      if (appointmentDateTime < apptEnd && endDateTime > apptStart) {
        overlapCount++;
        if (appt.bayNumber) occupiedBays.push(appt.bayNumber);
      }
    }

    if (overlapCount >= maxBays) {
      return res.status(409).json({ error: 'All bays are booked for this time slot' });
    }

    const freeBay = [1, 2, 3].find(b => !occupiedBays.includes(b)) || 1;

  
    const appointment = new Appointment({
      customerId: null, 
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone,
      customerAddress: customerAddress || undefined,
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || undefined,
        registration: vehicle.registration,
        color: vehicle.color || undefined
      },
      packageId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      duration: serviceDuration,
      notes: notes || '',
      bayNumber: freeBay,
      status: 'confirmed', 
      payment: {
        amount: service.price,
        status: 'pending', 
        paymentMethod: 'cash', 
        transactionId: `WALKIN-${Date.now()}`
      },
      bookingType: 'admin',
      isWalkIn: true
    });

    const saved = await appointment.save();
    const populated = await Appointment.findById(saved._id).populate('packageId', 'pkgName category description duration price image');

    res.status(201).json({
      success: true,
      message: 'Walk-in appointment created successfully',
      appointment: populated
    });

  } catch (err) {
    console.error('Admin booking error:', err);
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { customerId, customerName, vehicle, packageId, appointmentDate, startTime, notes, payment } = req.body;

    if (!customerName || !vehicle || !packageId || !appointmentDate || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ error: 'Invalid packageId' });
    }

    const servicePackage = await ServicePackage.findById(packageId);
    if (!servicePackage) return res.status(404).json({ error: 'Service package not found' });

    
    const duration = servicePackage.duration; 
    const startDateTime = new Date(`${appointmentDate}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    const endTime = endDateTime.toTimeString().substring(0, 5);

    // Check 2-hour advance booking requirement for same-day appointments
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const requestDateOnly = new Date(appointmentDate);
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (requestDateOnly.getTime() === todayDateOnly.getTime() && startDateTime < twoHoursFromNow) {
      return res.status(400).json({ 
        error: 'Appointments must be booked at least 2 hours in advance for same-day bookings. Please select a time after ' + twoHoursFromNow.toTimeString().substring(0, 5)
      });
    }

    
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const maxBays = 3;
    let overlapCount = 0;
    const occupiedBays = [];

    for (const appt of existingAppointments) {
      const apptStart = new Date(`${appt.appointmentDate.toISOString().split('T')[0]}T${appt.startTime}:00`);
      const apptEnd = new Date(apptStart.getTime() + (appt.duration || duration) * 60000);

      if (startDateTime < apptEnd && endDateTime > apptStart) {
        overlapCount++;
        if (appt.bayNumber) occupiedBays.push(appt.bayNumber);
      }
    }

    if (overlapCount >= maxBays) {
      return res.status(409).json({ error: 'All bays are booked' });
    }

    const freeBay = [1, 2, 3].find(b => !occupiedBays.includes(b)) || 1;

    const appointment = new Appointment({
      customerId: customerId || null,
      customerName,
      vehicle,
      packageId,
      appointmentDate,
      startTime,
      endTime,
      duration,
      notes: notes || '',
      bayNumber: freeBay,
      payment
    });

    const saved = await appointment.save();
    await saved.populate('packageId', 'pkgName duration price');

    res.status(201).json(saved);

  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('packageId');
    
    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });

    const update = {};
    if (status) {
      const validAppt = ['confirmed', 'pending', 'cancelled', 'completed'];
      if (!validAppt.includes(status)) return res.status(400).json({ error: 'Invalid appointment status' });
      update.status = status;
    }
    if (paymentStatus) {
      const validPay = ['pending', 'completed', 'failed', 'refunded'];
      if (!validPay.includes(paymentStatus)) return res.status(400).json({ error: 'Invalid payment status' });
      update['payment.status'] = paymentStatus;
    }
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const appt = await Appointment.findByIdAndUpdate(id, update, { new: true }).populate('packageId', 'pkgName');
    if (!appt) return res.status(404).json({ error: 'Not found' });
    res.json(appt);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});


router.put('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, startTime, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!appointmentDate || !startTime) {
      return res.status(400).json({ error: 'appointmentDate and startTime are required' });
    }

   
    const existingAppointment = await Appointment.findById(id).populate('packageId');
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    
    if (existingAppointment.status === 'cancelled' || existingAppointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot reschedule cancelled or completed appointments' });
    }

   
    const servicePackage = existingAppointment.packageId;
    const duration = servicePackage.duration || 60;
    const newStartDateTime = new Date(`${appointmentDate}T${startTime}:00`);
    const newEndDateTime = new Date(newStartDateTime.getTime() + duration * 60000);
    const newEndTime = newEndDateTime.toTimeString().substring(0, 5);

    // Check 2-hour advance booking requirement for same-day appointments
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const requestDateOnly = new Date(appointmentDate);
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (requestDateOnly.getTime() === todayDateOnly.getTime() && newStartDateTime < twoHoursFromNow) {
      return res.status(400).json({ 
        error: 'Appointments must be booked at least 2 hours in advance for same-day bookings. Please select a time after ' + twoHoursFromNow.toTimeString().substring(0, 5)
      });
    }

    
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      _id: { $ne: id }, 
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const maxBays = 3;
    let overlapCount = 0;
    const occupiedBays = [];

    for (const appt of existingAppointments) {
      const apptStart = new Date(`${appt.appointmentDate.toISOString().split('T')[0]}T${appt.startTime}:00`);
      const apptEnd = new Date(apptStart.getTime() + (appt.duration || duration) * 60000);

      if (newStartDateTime < apptEnd && newEndDateTime > apptStart) {
        overlapCount++;
        if (appt.bayNumber) occupiedBays.push(appt.bayNumber);
      }
    }

    if (overlapCount >= maxBays) {
      return res.status(409).json({ error: 'New time slot is not available. All bays are occupied.' });
    }

    
    const freeBay = [1, 2, 3].find(b => !occupiedBays.includes(b)) || 1;


    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime: newEndTime,
        bayNumber: freeBay,
        notes: notes || existingAppointment.notes,
        status: 'confirmed' 
      },
      { new: true, runValidators: true }
    ).populate('packageId', 'pkgName category duration price');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment
    });

  } catch (err) {
    console.error('Reschedule appointment error:', err);
    res.status(500).json({ error: 'Failed to reschedule appointment', details: err.message });
  }
});


router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, transactionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!paymentStatus) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const appointment = await Appointment.findById(id).populate('packageId');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if appointment is cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot update payment for cancelled appointments' });
    }

    // Update payment information
    appointment.payment.status = paymentStatus;
    if (paymentMethod) {
      appointment.payment.paymentMethod = paymentMethod;
    }
    if (transactionId) {
      appointment.payment.transactionId = transactionId;
    }

    const updatedAppointment = await appointment.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      appointment: updatedAppointment
    });

  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ error: 'Failed to update payment status', details: err.message });
  }
});


router.delete('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { refundReason, refundMethod } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id).populate('packageId');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

   
    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed appointments' });
    }

    
    const refundAmount = appointment.payment?.amount || 0;
    const originalPaymentStatus = appointment.payment?.status;

    
    appointment.status = 'cancelled';
    appointment.payment.status = 'refunded';
    appointment.payment.refundAmount = refundAmount;
    appointment.payment.refundReason = refundReason || 'Customer requested cancellation';
    appointment.payment.refundMethod = refundMethod || 'original_payment_method';
    appointment.payment.refundDate = new Date();

    const cancelledAppointment = await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment,
      refund: {
        amount: refundAmount,
        reason: refundReason || 'Customer requested cancellation',
        method: refundMethod || 'original_payment_method',
        date: new Date(),
        status: 'processed'
      }
    });

  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment', details: err.message });
  }
});


router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id).populate('packageId', 'pkgName category description duration price');
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    
    const appointmentDate = appointment.appointmentDate instanceof Date 
      ? appointment.appointmentDate 
      : new Date(appointment.appointmentDate);

    const report = {
      appointmentId: appointment._id,
      customerName: appointment.customerName,
      vehicle: appointment.vehicle,
      service: {
        name: appointment.packageId?.pkgName || 'Service',
        category: appointment.packageId?.category || 'General',
        description: appointment.packageId?.description || '',
        duration: appointment.duration || appointment.packageId?.duration || 60,
        price: appointment.payment?.amount || 0
      },
      schedule: {
        date: appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: `${appointment.startTime} - ${appointment.endTime}`,
        bayNumber: appointment.bayNumber
      },
      payment: {
        amount: appointment.payment?.amount || 0,
        status: appointment.payment?.status || 'pending',
        transactionId: appointment.payment?.transactionId || '',
        paymentMethod: appointment.payment?.paymentMethod || 'card'
      },
      status: appointment.status,
      notes: appointment.notes || '',
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      refund: appointment.payment?.status === 'refunded' ? {
        amount: appointment.payment?.refundAmount || 0,
        reason: appointment.payment?.refundReason || '',
        date: appointment.payment?.refundDate
      } : null
    };

    res.json({
      success: true,
      report,
      generatedAt: new Date()
    });

  } catch (err) {
    console.error('Generate report error:', err);
    res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
});


router.get('/reports/summary', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let filter = {};
    
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('packageId', 'pkgName category')
      .sort({ appointmentDate: -1 });

    
    const totalAppointments = appointments.length;
    const totalRevenue = appointments.reduce((sum, appt) => {
      return sum + (appt.payment?.amount || 0);
    }, 0);
    
    const statusCounts = appointments.reduce((counts, appt) => {
      counts[appt.status] = (counts[appt.status] || 0) + 1;
      return counts;
    }, {});

    const serviceStats = appointments.reduce((stats, appt) => {
      const serviceName = appt.packageId?.pkgName || 'Unknown';
      if (!stats[serviceName]) {
        stats[serviceName] = { count: 0, revenue: 0 };
      }
      stats[serviceName].count += 1;
      stats[serviceName].revenue += (appt.payment?.amount || 0);
      return stats;
    }, {});

    const summaryReport = {
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present'
      },
      statistics: {
        totalAppointments,
        totalRevenue,
        statusCounts,
        serviceStats
      },
      appointments: appointments.map(appt => ({
        id: appt._id,
        customerName: appt.customerName,
        vehicle: appt.vehicle,
        service: appt.packageId?.pkgName || 'Service',
        date: appt.appointmentDate,
        time: `${appt.startTime} - ${appt.endTime}`,
        bayNumber: appt.bayNumber,
        amount: appt.payment?.amount || 0,
        status: appt.status,
        paymentStatus: appt.payment?.status
      }))
    };

    res.json({
      success: true,
      report: summaryReport,
      generatedAt: new Date()
    });

  } catch (err) {
    console.error('Generate summary report error:', err);
    res.status(500).json({ error: 'Failed to generate summary report', details: err.message });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    if (!deletedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ 
      message: 'Appointment deleted successfully', 
      deletedAppointment: {
        id: deletedAppointment._id,
        customerName: deletedAppointment.customerName,
        appointmentDate: deletedAppointment.appointmentDate
      }
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment', details: error.message });
  }
});


router.post('/update-past', async (req, res) => {
  try {
    const result = await updatePastAppointments();
    res.json({ 
      message: 'Past appointments updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Update past appointments error:', error);
    res.status(500).json({ error: 'Failed to update past appointments', details: error.message });
  }
});

export default router;