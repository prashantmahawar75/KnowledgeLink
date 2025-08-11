import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-lg"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">KnowledgeLink</h1>
          </div>
          <h2 className="text-xl text-slate-600 mb-8">
            Your AI-Powered Personal Knowledge Base
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Save web links and let AI automatically generate summaries and create searchable 
            embeddings. Find exactly what you're looking for using natural language search.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-link text-blue-600"></i>
              </div>
              <h3 className="font-semibold mb-2">Save Links</h3>
              <p className="text-sm text-slate-600">
                Simply paste a URL and we'll extract and process the content automatically
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-brain text-green-600"></i>
              </div>
              <h3 className="font-semibold mb-2">AI Summaries</h3>
              <p className="text-sm text-slate-600">
                Get concise, intelligent summaries of every article you save
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-purple-600"></i>
              </div>
              <h3 className="font-semibold mb-2">Smart Search</h3>
              <p className="text-sm text-slate-600">
                Find content using natural language queries powered by vector search
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-indigo-600"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Get Started
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Sign in securely to start building your knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
