// automatically update past appointments to completed status
import Appointment from '../models/Appointment.js';
import cron from 'node-cron';


export async function updatePastAppointments() {
  try {
    const now = new Date();

    
    const appointments = await Appointment.find({
      status: { $in: ['confirmed', 'pending'] }
    });

    let updatedCount = 0;

    for (const appointment of appointments) {
      
      const appointmentDate = new Date(appointment.appointmentDate);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      
    
      const appointmentEndDateTime = new Date(appointmentDate);
      appointmentEndDateTime.setHours(endHours, endMinutes, 0, 0);

     
      if (now > appointmentEndDateTime) {
        appointment.status = 'completed';
        await appointment.save();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Auto-updated ${updatedCount} past appointment(s) to completed status`);
    }

    return { modifiedCount: updatedCount };
  } catch (error) {
    console.error('❌ Error updating past appointments:', error);
    throw error;
  }
}


export async function getCurrentAndFutureAppointments(query = {}) {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      ...query,
      appointmentDate: { $gte: startOfToday }
    })
      .populate('packageId', 'pkgName category duration price')
      .populate('customerId', 'name email phoneNumbers')
      .sort({ appointmentDate: 1, startTime: 1 });

    return appointments;
  } catch (error) {
    console.error('❌ Error fetching future appointments:', error);
    throw error;
  }
}


export function initializeAppointmentScheduler() {
  // Run every hour at the start of the hour (0 minutes)
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running scheduled task: Checking appointments to mark as completed...');
    await updatePastAppointments();
  });

  
  console.log('🚀 Initializing appointment scheduler...');
  updatePastAppointments();

  console.log('✅ Appointment scheduler initialized - will run every hour to check completed appointments');
}
