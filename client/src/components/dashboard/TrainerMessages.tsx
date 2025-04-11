import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function TrainerMessages() {
  const { user } = useAuth();
  
  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['/api/messages/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  // Mutation to mark a message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest('PATCH', `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      refetch();
    }
  });

  const handleReply = (messageId: number) => {
    // Mark the message as read when replying
    markAsReadMutation.mutate(messageId);
    // In a real app, this would open a reply form
    console.log("Reply to message:", messageId);
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    
    return `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-dark">Trainer Messages</h3>
          <Link href="/messages" className="text-secondary text-sm font-medium">View All</Link>
        </div>
        
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
          <div className="mt-4 text-center">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-dark">Trainer Messages</h3>
        <Link href="/messages" className="text-secondary text-sm font-medium">View All</Link>
      </div>
      
      <div className="space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message: Message) => (
            <div key={message.id} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition">
              <div className="flex items-center mb-3">
                <img 
                  className="h-10 w-10 rounded-full object-cover" 
                  src={message.sender.profileImage || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"} 
                  alt={`${message.sender.firstName} ${message.sender.lastName}`} 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {message.sender.firstName} {message.sender.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTimeAgo(message.timestamp.toString())}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{message.message}</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleReply(message.id)}
                  className="bg-secondary bg-opacity-10 text-secondary px-3 py-1 rounded text-xs font-medium hover:bg-opacity-20 transition"
                >
                  Reply
                </button>
                <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition">
                  View Plan
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">No messages yet</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/schedule">
            <button className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              Schedule Session
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
