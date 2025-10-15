import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["card", "cash"], required: true },
  cardDetails: {
    cardNumber: String,
    cardholderName: String,
    expiryDate: String,
    cvv: String,
  },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  transactionId: String,
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
