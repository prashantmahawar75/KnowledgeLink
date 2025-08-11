import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function SearchAndSubmit() {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest("POST", "/api/links", { url });
    },
    onSuccess: (data) => {
      const isPartialSuccess = data.summary && data.summary.includes("could not be automatically processed");
      const isAIUnavailable = data.summary && data.summary.includes("AI summarization is currently unavailable");
      
      let title = "Success";
      let description = "Link added and AI summary generated successfully!";
      
      if (isAIUnavailable) {
        title = "Link saved - AI unavailable";
        description = "Link saved successfully! AI features need a valid Gemini API key to work.";
      } else if (isPartialSuccess) {
        title = "Link saved with limited info";
        description = "Link saved but content couldn't be extracted. You can still search and organize it!";
      }
      
      toast({ title, description });
      setUrl("");
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
        description: error instanceof Error ? error.message : "Failed to add link",
        variant: "destructive",
      });
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ['/api/search', { q: searchQuery, limit: 10 }],
    enabled: searchQuery.length > 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      new URL(url);
      addLinkMutation.mutate(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-8">
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* URL Submission */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-3">
                <i className="fas fa-link text-primary mr-2"></i>
                Add New Link
              </Label>
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <Input
                  type="url"
                  placeholder="Paste URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  data-testid="input-url"
                />
                <Button 
                  type="submit" 
                  disabled={addLinkMutation.isPending || !url}
                  className="bg-primary hover:bg-indigo-600"
                  data-testid="button-submit"
                >
                  {addLinkMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i>
                      Add
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-slate-500 mt-2">
                We'll automatically extract content and generate an AI summary
              </p>
            </div>
            
            {/* Search */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-3">
                <i className="fas fa-search text-secondary mr-2"></i>
                Search Your Knowledge Base
              </Label>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Ask a question or search for topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
                  data-testid="input-search"
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Search using natural language - try "articles about machine learning"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
