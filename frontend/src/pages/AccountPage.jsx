import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, Phone, Calendar, Settings } from 'lucide-react';

const AccountPage = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
            My Account
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Manage your account settings and view your appointments
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">John Doe</p>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">john.doe@example.com</p>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-6" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Appointments</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-secondary-light rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Premium Car Service</p>
                    <p className="text-sm text-muted-foreground">Dec 15, 2024 at 10:00 AM</p>
                  </div>
                  <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">Completed</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary-light rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Car Detailing</p>
                    <p className="text-sm text-muted-foreground">Dec 20, 2024 at 2:00 PM</p>
                  </div>
                  <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">Upcoming</span>
                </div>
              </div>
              <Button className="w-full mt-6" variant="outline">
                View All Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;