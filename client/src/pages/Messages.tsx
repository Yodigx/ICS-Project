import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Message, User } from "@/types";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [messageText, setMessageText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Fetch user's messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  // Fetch all trainers for the contacts list
  const { data: trainers, isLoading: isLoadingTrainers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    // In a real app, you would filter by isTrainer=true
    enabled: !!user?.id,
  });

  const isLoading = isLoadingMessages || isLoadingTrainers;

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { senderId: number; receiverId: number; message: string }) => {
      await apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages/user/' + user?.id] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation to mark a message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest('PATCH', `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/user/' + user?.id] });
    }
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact || !user) return;
    
    sendMessageMutation.mutate({
      senderId: user.id,
      receiverId: selectedContact.id,
      message: messageText
    });
  };

  const handleSelectContact = (contact: User) => {
    setSelectedContact(contact);
    
    // Mark messages from this contact as read
    if (messages) {
      messages
        .filter((msg: Message) => msg.sender.id === contact.id && !msg.read)
        .forEach((msg: Message) => {
          markAsReadMutation.mutate(msg.id);
        });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    
    return `${days}d ago`;
  };

  // Group messages by sender for the contacts list
  const getContacts = () => {
    if (!messages || !trainers) return [];
    
    // Filter trainers by search query
    const filteredTrainers = trainers.filter((trainer: User) => {
      const fullName = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
    
    return filteredTrainers;
  };

  // Get messages for the selected contact
  const getConversation = () => {
    if (!messages || !selectedContact) return [];
    
    return messages
      .filter((msg: Message) => msg.sender.id === selectedContact.id)
      .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Count unread messages from a specific sender
  const countUnreadMessages = (senderId: number) => {
    if (!messages) return 0;
    
    return messages.filter((msg: Message) => msg.sender.id === senderId && !msg.read).length;
  };

  // Get the last message from a specific sender
  const getLastMessage = (senderId: number) => {
    if (!messages) return null;
    
    const senderMessages = messages.filter((msg: Message) => msg.sender.id === senderId);
    if (senderMessages.length === 0) return null;
    
    return senderMessages.sort((a: Message, b: Message) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };

  return (
    <MainLayout title="Messages">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>Your trainers and coaches</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search contacts..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="trainers">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="trainers" className="flex-1">Trainers</TabsTrigger>
                  <TabsTrigger value="clients" className="flex-1">Clients</TabsTrigger>
                </TabsList>
                
                <TabsContent value="trainers">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getContacts().length > 0 ? (
                        getContacts().map((contact: User) => {
                          const lastMessage = getLastMessage(contact.id);
                          const unreadCount = countUnreadMessages(contact.id);
                          
                          return (
                            <div 
                              key={contact.id}
                              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-gray-50 border-l-4 border-primary' : ''}`}
                              onClick={() => handleSelectContact(contact)}
                            >
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage 
                                  src={contact.profileImage} 
                                  alt={`${contact.firstName} ${contact.lastName}`} 
                                />
                                <AvatarFallback>
                                  {getInitials(contact.firstName, contact.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium truncate">
                                    {contact.firstName} {contact.lastName}
                                  </h4>
                                  {lastMessage && (
                                    <span className="text-xs text-gray-500">
                                      {getTimeAgo(lastMessage.timestamp.toString())}
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {lastMessage ? lastMessage.message : 'No messages yet'}
                                  </p>
                                  {unreadCount > 0 && (
                                    <Badge className="ml-2">{unreadCount}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">No contacts found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="clients">
                  <div className="text-center p-6">
                    <p className="text-gray-500">Client messaging coming soon.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedContact ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage 
                        src={selectedContact.profileImage} 
                        alt={`${selectedContact.firstName} ${selectedContact.lastName}`} 
                      />
                      <AvatarFallback>
                        {getInitials(selectedContact.firstName, selectedContact.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </CardTitle>
                      <CardDescription>
                        {selectedContact.isTrainer ? 'Fitness Trainer' : 'Client'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto py-4">
                  {getConversation().length > 0 ? (
                    <div className="space-y-4">
                      {getConversation().map((message: Message) => (
                        <div key={message.id} className="flex items-start">
                          <Avatar className="h-8 w-8 mr-3 mt-1">
                            <AvatarImage 
                              src={message.sender.profileImage} 
                              alt={`${message.sender.firstName} ${message.sender.lastName}`} 
                            />
                            <AvatarFallback>
                              {getInitials(message.sender.firstName, message.sender.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="text-sm font-medium">
                                {message.sender.firstName} {message.sender.lastName}
                              </h5>
                              <span className="text-xs text-gray-500">
                                {window.formatDate(new Date(message.timestamp), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <p className="text-gray-500">No messages yet. Send a message to start the conversation.</p>
                    </div>
                  )}
                </CardContent>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea 
                      placeholder="Type your message here..." 
                      className="min-h-[80px] resize-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <Button 
                      className="self-end" 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center">
                <div>
                  <h3 className="text-lg font-medium mb-2">Select a contact to start messaging</h3>
                  <p className="text-gray-500">Choose a trainer or coach from the list to view your conversation.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
