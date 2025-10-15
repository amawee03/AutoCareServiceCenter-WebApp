import express from "express";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js"; // ✅ IMPORT YOUR PAYMENT MODEL
import mongoose from "mongoose";

const router = express.Router();

// === PROCESS PAYMENT ===
router.post("/pay", async (req, res) => {
  console.log("=== PAYMENT ROUTE START ===");
  console.log("Request body:", req.body);

  try {
    const { appointmentId, amount, method, cardDetails } = req.body;

    // ✅ Validate required fields
    if (!appointmentId || !amount || !method) {
      return res.status(400).json({
        error: "Missing required fields",
        received: { appointmentId, amount, method },
      });
    }

    // ✅ Validate appointmentId format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        error: "Invalid appointment ID format",
        appointmentId,
      });
    }

    // ✅ Check if appointment exists
    const appointment = await Appointment.findById(appointmentId).populate("packageId");
    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
        appointmentId,
      });
    }

    console.log("Found appointment:", {
      id: appointment._id,
      customerName: appointment.customerName,
      currentPaymentStatus: appointment.payment?.status,
    });

    // ✅ Check if already paid
    if (appointment.payment && appointment.payment.status === "completed") {
      return res.status(400).json({
        error: "Appointment is already paid",
        appointmentId,
        currentStatus: appointment.payment.status,
      });
    }

    // ✅ Generate transactionId
    const transactionId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // ✅ CREATE PAYMENT DOCUMENT IN PAYMENT COLLECTION
    const newPayment = new Payment({
      appointmentId: appointmentId,
      amount: parseFloat(amount),
      method: method,
      status: "paid", // Use 'paid' to match your schema enum
      transactionId: transactionId,
    });

    // Add card details if payment method is card
    if (method === "card" && cardDetails) {
      newPayment.cardDetails = {
        cardNumber: cardDetails.cardNumber || "",
        cardholderName: cardDetails.cardHolder || cardDetails.cardholderName || "",
        expiryDate: cardDetails.expiryDate || "",
        cvv: cardDetails.cvv || "", // Note: Don't store CVV in production!
      };
    }

    // Save payment document
    const savedPayment = await newPayment.save();
    console.log("Payment document created:", savedPayment._id);

    // ✅ UPDATE APPOINTMENT WITH PAYMENT INFO
    appointment.payment = {
      amount: parseFloat(amount),
      status: "completed",
      transactionId: transactionId,
      paymentMethod: method,
    };

    if (method === "card" && cardDetails) {
      appointment.payment.cardHolder = cardDetails.cardHolder || cardDetails.cardholderName || "";
      appointment.payment.last4 = cardDetails.cardNumber
        ? cardDetails.cardNumber.slice(-4)
        : "";
    }

    // Keep appointment confirmed when payment is completed
    appointment.status = "confirmed";

    const updatedAppointment = await appointment.save();
    console.log("Appointment updated with payment info");

    const response = {
      success: true,
      message: "Payment processed successfully",
      appointment: updatedAppointment,
      payment: savedPayment, // Return the payment document too
    };

    console.log("=== PAYMENT ROUTE SUCCESS ===");
    return res.status(200).json(response);
  } catch (err) {
    console.error("=== PAYMENT ROUTE ERROR ===");
    console.error(err);
    return res.status(500).json({
      error: "Payment failed",
      details: err.message,
    });
  }
});

// === GET PAYMENT INFO FOR ONE APPOINTMENT ===
router.get("/appointment/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    // Get both appointment and payment documents
    const appointment = await Appointment.findById(appointmentId).populate("packageId");
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const payment = await Payment.findOne({ appointmentId: appointmentId });

    res.json({
      success: true,
      payment: appointment.payment, // Payment info from appointment
      paymentDocument: payment, // Separate payment document
      appointmentId: appointment._id,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch payment info",
      details: err.message,
    });
  }
});

// === GET ALL PAYMENTS (FROM PAYMENT COLLECTION) ===
router.get("/", async (req, res) => {
  try {
    const { status, method } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "appointmentId",
        populate: { path: "packageId" }
      });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch payments",
      details: err.message,
    });
  }
});

export default router;