import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { StatsResponse, User } from "@shared/schema";

export default function Header() {
  const { user } = useAuth() as { user: User | undefined };
  
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900">KnowledgeLink</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
              <span data-testid="text-link-count">{stats?.totalLinks || 0}</span>
              <span>links saved</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="User profile" 
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="img-avatar"
                />
              ) : (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-slate-500 text-sm"></i>
                </div>
              )}
              <span className="text-sm font-medium text-slate-700" data-testid="text-username">
                {user?.firstName || user?.email || 'User'}
              </span>
              <button 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
