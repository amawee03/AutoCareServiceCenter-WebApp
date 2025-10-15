import React, { Fragment } from 'react'

const ProgressStepper = ({ currentStep }) => {
  const steps = [
    {
      id: 1,
      name: 'Service',
    },
    {
      id: 2,
      name: 'Appointment',
    },
    {
      id: 3,
      name: 'Payment',
    },
    {
      id: 4,
      name: 'Confirmation',
    },
  ]

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                <div
                  className={`text-xs mt-1 font-medium ${
                    currentStep >= step.id 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step.id 
                      ? 'bg-red-600' 
                      : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressStepper