// AppointmentModel.js
import mongoose from 'mongoose';
import JobProgress from './JobProgressModel.js'; 

const ServicePackage = mongoose.models.ServicePackage || mongoose.model('ServicePackage', new mongoose.Schema({
    pkgName: { type: String, required: true },
    
}, { collection: 'servicepackages' }));


const appointmentSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false 
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },
    customerAddress: { type: String },
    
    vehicle: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePackage',
        required: true
    },
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String }, 
    duration: { type: Number },
    notes: String,
    bayNumber: { type: Number, required: true },
    bookingType: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isWalkIn: { type: Boolean, default: false },
    payment: {
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paymentMethod: String,
        refundAmount: Number,
        refundReason: String,
        refundMethod: String,
        refundDate: Date
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled', 'completed'],
        default: 'confirmed'
    }
}, { timestamps: true });


// create job
async function createJobFromAppointment(doc) {
    if (!doc) return;

   
    if (doc.status !== "confirmed" || doc.payment?.status !== "completed") {
        return;
    }

    const exists = await JobProgress.findOne({ bookingId: doc._id.toString() });
    if (exists) return; 

    // 1. Get Service Package Name
    let serviceName = "Unknown Service";
    try {
        const pkg = await ServicePackage.findById(doc.packageId).select('pkgName').lean();
        if (pkg) {
            serviceName = pkg.pkgName;
        }
    } catch (error) {
        console.error(`Error fetching ServicePackage for ID ${doc.packageId}:`, error.message);
    }
    
   
    const [hours, minutes] = doc.startTime.split(':').map(Number);
    const jobTime = new Date(doc.appointmentDate);
    
    jobTime.setHours(hours, minutes, 0, 0); 
    
    
    const initialStages = [
        { name: "Check-in", completed: false },
        { name: "Wash", completed: false },
        { name: "Interior", completed: false },
        { name: "Polishing", completed: false },
        { name: "Inspection", completed: false },
        { name: "Completed", completed: false },
    ];

    
    let vehicleMake = "Unknown";
    let vehicleReg = `TEMP-${Math.floor(Math.random() * 10000)}`;
    
    if (doc.vehicle) {
        if (typeof doc.vehicle === 'object') {
            // Vehicle is stored as object with make, model, licensePlate
            vehicleMake = doc.vehicle.make && doc.vehicle.model 
                ? `${doc.vehicle.make} ${doc.vehicle.model}` 
                : doc.vehicle.make || doc.vehicle.model || "Unknown";
            vehicleReg = doc.vehicle.licensePlate || doc.vehicle.registration || vehicleReg;
        } else {
           
            vehicleMake = doc.vehicle;
        }
    }

    const job = new JobProgress({
        id: `JOB-${doc._id}`,
        bookingId: doc._id.toString(),
        customerName: doc.customerName,
        vehicleMake: vehicleMake,
        vehicleReg: vehicleReg,
        service: serviceName,
        time: jobTime,
        status: "scheduled",
        currentStage: initialStages[0].name,
        progress: 0,
        bayNumber: doc.bayNumber,
        stages: initialStages,
       
    });

    await job.save();
    console.log(` JobProgress created for appointment ${doc._id}`);
}


appointmentSchema.post("save", async function (doc, next) {
    await createJobFromAppointment(doc);
    next();
});


appointmentSchema.post("findOneAndUpdate", async function (doc, next) {
    
    await createJobFromAppointment(doc);
    next();
});
 
export default mongoose.model('Appointment', appointmentSchema);