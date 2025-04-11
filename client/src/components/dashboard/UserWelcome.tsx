import { useAuth } from '@/hooks/useAuth';

export default function UserWelcome() {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-dark">
        Welcome back, <span>{user?.firstName || 'User'}!</span>
      </h2>
      <p className="text-gray-600">Let's continue making progress on your fitness journey.</p>
    </div>
  );
}
