import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    weight: user?.weight || '',
    height: user?.height || '',
    age: user?.age || '',
    goal: user?.goal || '',
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save profile
  const handleSave = async () => {
    try {
      if (!user?.id) return;
      
      await apiRequest('PATCH', `/api/users/${user.id}`, formData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  return (
    <MainLayout title="My Profile">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and account settings
                  </CardDescription>
                </div>
                <Avatar className="w-24 h-24 mt-4 md:mt-0">
                  <AvatarImage src={user?.profileImage || ''} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="text-xl bg-primary text-white">
                    {getInitials(user?.firstName || '', user?.lastName || '')}
                  </AvatarFallback>
                </Avatar>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Input
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      <span className="text-gray-500">Username: </span> 
                      <span>{user?.username}</span>
                    </p>
                    <p className="text-sm font-medium">
                      <span className="text-gray-500">Plan: </span>
                      <span className="text-primary">{user?.plan}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="destructive" onClick={logout}>
                      Logout
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Preference settings will appear here in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>
                  Review your recent activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Your activity history will appear here in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}