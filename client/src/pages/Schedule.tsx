import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClassSchedule, ClassEnrollment } from "@/types";

export default function Schedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fetch class schedules
  const { data: classSchedules, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/class-schedules'],
    enabled: !!user,
  });
  
  // Fetch user's enrollments
  const { data: userEnrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['/api/class-enrollments/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });
  
  const isLoading = isLoadingClasses || isLoadingEnrollments;

  // Mutation to enroll in a class
  const enrollMutation = useMutation({
    mutationFn: async (classId: number) => {
      await apiRequest('POST', '/api/class-enrollments', {
        userId: user?.id,
        classId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-enrollments/user/' + user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/class-schedules'] });
      toast({
        title: "Enrolled Successfully",
        description: "You have successfully enrolled in the class.",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Failed to enroll in class. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEnroll = (classId: number) => {
    enrollMutation.mutate(classId);
  };

  const isUserEnrolled = (classId: number): boolean => {
    if (!userEnrollments) return false;
    return userEnrollments.some((enrollment: ClassEnrollment) => enrollment.classId === classId);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Filter classes for the selected date
  const getClassesForDate = (date: Date) => {
    if (!classSchedules) return [];
    
    return classSchedules.filter((cs: ClassSchedule) => {
      const classDate = new Date(cs.startTime);
      return classDate.getDate() === date.getDate() && 
             classDate.getMonth() === date.getMonth() && 
             classDate.getFullYear() === date.getFullYear();
    });
  };

  // Get date tabs for the next 7 days
  const getDateTabs = () => {
    const tabs = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      tabs.push(date);
    }
    
    return tabs;
  };

  const formatDateValue = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${window.formatDate(start, 'h:mm a')} - ${window.formatDate(end, 'h:mm a')}`;
  };

  return (
    <MainLayout title="Class Schedule">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>Browse and enroll in fitness classes led by expert trainers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue={formatDateValue(new Date())} 
            onValueChange={(value) => setSelectedDate(new Date(value))}
          >
            <TabsList className="mb-6 flex flex-wrap h-auto">
              {getDateTabs().map((date, index) => (
                <TabsTrigger 
                  key={formatDateValue(date)} 
                  value={formatDateValue(date)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{window.formatDate(date, 'EEE')}</span>
                    <span className="text-lg font-semibold">{date.getDate()}</span>
                    {index === 0 && <span className="text-xs">Today</span>}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {getDateTabs().map(date => (
              <TabsContent key={formatDateValue(date)} value={formatDateValue(date)}>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {getClassesForDate(date).length > 0 ? (
                      <div className="space-y-4">
                        {getClassesForDate(date).map((classItem: ClassSchedule) => (
                          <div key={classItem.id} className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg hover:border-primary hover:bg-gray-50 transition">
                            <div className="flex items-center flex-1 mb-4 md:mb-0">
                              <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage 
                                  src={classItem.trainer.profileImage} 
                                  alt={`${classItem.trainer.firstName} ${classItem.trainer.lastName}`} 
                                />
                                <AvatarFallback>
                                  {getInitials(classItem.trainer.firstName, classItem.trainer.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{classItem.className}</h4>
                                <p className="text-sm text-gray-500">
                                  {classItem.trainer.firstName} {classItem.trainer.lastName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimeRange(classItem.startTime, classItem.endTime)}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                              <Badge variant="outline" className="md:mr-4">
                                {classItem.currentParticipants}/{classItem.maxParticipants} Spots
                              </Badge>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant={isUserEnrolled(classItem.id) ? "outline" : "default"}>
                                    {isUserEnrolled(classItem.id) ? 'Enrolled' : 'Enroll Now'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Class Details: {classItem.className}</DialogTitle>
                                    <DialogDescription>
                                      Led by {classItem.trainer.firstName} {classItem.trainer.lastName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="py-4">
                                    <p className="mb-4">{classItem.description || 'Join this exciting fitness class designed to help you reach your fitness goals.'}</p>
                                    
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Date & Time:</span>
                                        <span>{window.formatDate(new Date(classItem.startTime), 'EEEE, MMMM d')} at {formatTimeRange(classItem.startTime, classItem.endTime)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Duration:</span>
                                        <span>{Math.round((new Date(classItem.endTime).getTime() - new Date(classItem.startTime).getTime()) / (1000 * 60))} minutes</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-medium">Available Spots:</span>
                                        <span>{classItem.maxParticipants - classItem.currentParticipants} of {classItem.maxParticipants}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    {isUserEnrolled(classItem.id) ? (
                                      <Button disabled>
                                        Already Enrolled
                                      </Button>
                                    ) : (
                                      <Button 
                                        onClick={() => handleEnroll(classItem.id)}
                                        disabled={classItem.currentParticipants >= classItem.maxParticipants}
                                      >
                                        Confirm Enrollment
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-12 border border-dashed rounded-lg">
                        <p className="text-gray-500 mb-2">No classes scheduled for this date.</p>
                        <p className="text-gray-500">Check back later or try another date.</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Enrolled Classes</CardTitle>
          <CardDescription>Classes you've signed up for</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEnrollments ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              {userEnrollments && userEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {userEnrollments.map((enrollment: ClassEnrollment) => (
                    <div key={enrollment.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-2 md:mb-0">
                          <h4 className="font-medium">{enrollment.class.className}</h4>
                          <p className="text-sm text-gray-500">
                            {window.formatDate(new Date(enrollment.class.startTime), 'EEEE, MMMM d')} • {
                              formatTimeRange(enrollment.class.startTime, enrollment.class.endTime)
                            }
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage 
                              src={enrollment.class.trainer.profileImage} 
                              alt={`${enrollment.class.trainer.firstName} ${enrollment.class.trainer.lastName}`} 
                            />
                            <AvatarFallback>
                              {getInitials(enrollment.class.trainer.firstName, enrollment.class.trainer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {enrollment.class.trainer.firstName} {enrollment.class.trainer.lastName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-2">You haven't enrolled in any classes yet.</p>
                  <p className="text-gray-500 mb-4">Browse the schedule above to find and join classes.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
