const AppointmentOverview = () => {
  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-4">Welcome to AutoCare</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-foreground">Total Services</h2>
          <p className="text-muted-foreground">12 completed</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-foreground">Upcoming Appointments</h2>
          <p className="text-muted-foreground">3 scheduled</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-foreground">Revenue</h2>
          <p className="text-muted-foreground">Rs. 36,000</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentOverview;
