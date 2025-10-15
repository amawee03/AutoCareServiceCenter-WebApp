// import React from 'react';
// import { Card, CardContent } from './ui/card';
// import { Button } from './ui/button';
// import { XCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';

// const AppointmentFailure = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { error, appointment } = location.state || {};

//   const handleTryAgain = () => {
//     if (appointment) {
//       // Go back to payment page with existing data
//       navigate('/appointment/payment', {
//         state: {
//           selectedService: appointment.servicePackage,
//           selectedDate: appointment.appointmentDate,
//           selectedSlot: {
//             startTime: appointment.startTime,
//             endTime: appointment.endTime
//           },
//           customerDetails: appointment.customer
//         }
//       });
//     } else {
//       // Go back to service selection
//       navigate('/appointment');
//     }
//   };

//   const handleGoHome = () => {
//     navigate('/');
//   };

//   const handleBookNew = () => {
//     navigate('/appointment');
//   };

//   return (
//     <div className="min-h-screen bg-background py-16">
//       <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
//         {/* Failure Header */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6">
//             <XCircle className="h-10 w-10 text-destructive" />
//           </div>
//           <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
//             Payment Failed
//           </h1>
//           <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
//             We're sorry, but your payment could not be processed at this time.
//           </p>
//         </div>

//         {/* Error Details Card */}
//         <Card className="mb-12 border-destructive/20 bg-destructive/5">
//           <CardContent className="p-8">
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-foreground mb-2">What Happened?</h2>
//               <p className="text-muted-foreground">There was an issue processing your payment</p>
//             </div>

//             <div className="bg-background border border-destructive/20 rounded-lg p-6 mb-6">
//               <h3 className="font-semibold text-foreground mb-2">Error Details:</h3>
//               <p className="text-muted-foreground">
//                 {error || 'An unexpected error occurred during payment processing. Please try again.'}
//               </p>
//             </div>

//             <div className="space-y-4">
//               <h3 className="font-semibold text-foreground">Common reasons for payment failure:</h3>
//               <ul className="space-y-2 text-muted-foreground">
//                 <li className="flex items-start gap-2">
//                   <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Insufficient funds in your account</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Incorrect card details (number, expiry date, or CVV)</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Card expired or blocked by your bank</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Network connectivity issues</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
//                   <span>Bank security measures preventing the transaction</span>
//                 </li>
//               </ul>
//             </div>
//           </CardContent>
//         </Card>

//         {/* What You Can Do */}
//         <Card className="mb-12">
//           <CardContent className="p-8">
//             <h2 className="text-2xl font-bold text-foreground mb-6 text-center">What You Can Do</h2>
//             <div className="grid md:grid-cols-3 gap-6">
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <RefreshCw className="h-6 w-6 text-primary" />
//                 </div>
//                 <h3 className="font-semibold text-foreground mb-2">Try Again</h3>
//                 <p className="text-sm text-muted-foreground">Double-check your card details and try the payment again</p>
//               </div>
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <span className="text-lg font-bold text-primary">💳</span>
//                 </div>
//                 <h3 className="font-semibold text-foreground mb-2">Use Different Card</h3>
//                 <p className="text-sm text-muted-foreground">Try using a different payment method or card</p>
//               </div>
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <span className="text-lg font-bold text-primary">📞</span>
//                 </div>
//                 <h3 className="font-semibold text-foreground mb-2">Contact Support</h3>
//                 <p className="text-sm text-muted-foreground">Call us at (555) 123-4567 for assistance</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <Button
//             onClick={handleTryAgain}
//             size="lg"
//             className="px-8 py-4 text-lg h-14 bg-primary hover:bg-primary-dark"
//           >
//             <RefreshCw className="h-5 w-5 mr-2" />
//             Try Payment Again
//           </Button>
//           <Button
//             onClick={handleBookNew}
//             variant="outline"
//             size="lg"
//             className="px-8 py-4 text-lg h-14"
//           >
//             <ArrowLeft className="h-5 w-5 mr-2" />
//             Start Over
//           </Button>
//           <Button
//             onClick={handleGoHome}
//             variant="outline"
//             size="lg"
//             className="px-8 py-4 text-lg h-14"
//           >
//             <Home className="h-5 w-5 mr-2" />
//             Go to Home
//           </Button>
//         </div>

//         {/* Contact Information */}
//         <div className="text-center mt-12">
//           <p className="text-muted-foreground mb-4">
//             Need help? Our support team is here to assist you.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
//             <span>📞 (555) 123-4567</span>
//             <span>✉️ support@autocare.com</span>
//             <span>🕒 Mon-Fri: 9AM-6PM</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentFailure;
