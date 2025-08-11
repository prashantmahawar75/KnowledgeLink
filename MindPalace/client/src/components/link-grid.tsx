import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Link } from "@shared/schema";

export default function LinkGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useQuery<Link[]>({
    queryKey: ['/api/links'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Link deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-slate-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-link text-slate-400 text-lg"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No links saved yet</h3>
          <p className="text-slate-600">
            Start building your knowledge base by adding your first link above
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} days ago`;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'technology': return 'bg-blue-100 text-blue-800';
      case 'development': return 'bg-purple-100 text-purple-800';
      case 'design': return 'bg-green-100 text-green-800';
      case 'database': return 'bg-orange-100 text-orange-800';
      case 'business': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid gap-6">
      {links.map((link) => (
        <Card key={link.id} className="hover:shadow-md transition-all duration-200" data-testid={`card-link-${link.id}`}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {link.favicon ? (
                  <img 
                    src={link.favicon} 
                    alt="Website favicon" 
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`;
                    }}
                    data-testid={`img-favicon-${link.id}`}
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center">
                    <i className="fas fa-globe text-slate-500 text-xs"></i>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors cursor-pointer" data-testid={`text-title-${link.id}`}>
                      {link.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1" data-testid={`text-domain-${link.id}`}>
                      {link.domain}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {link.category && (
                      <Badge className={getCategoryColor(link.category)} data-testid={`badge-category-${link.id}`}>
                        {link.category}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(link.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      data-testid={`button-delete-${link.id}`}
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </Button>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-4 leading-relaxed" data-testid={`text-summary-${link.id}`}>
                  {link.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span data-testid={`text-date-${link.id}`}>
                      {formatDate(link.createdAt || new Date().toISOString())}
                    </span>
                    {link.readTime && (
                      <>
                        <span>•</span>
                        <span data-testid={`text-readtime-${link.id}`}>
                          {link.readTime}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-indigo-600 transition-colors text-sm font-medium"
                      data-testid={`link-open-${link.id}`}
                    >
                      <i className="fas fa-external-link-alt mr-1"></i>
                      Open Link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
