import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLinkSchema, searchQuerySchema } from "@shared/schema";
import { scrapeUrl, categorizeContent } from "./services/scraper";
import { generateSummary, generateEmbedding, generateSearchEmbedding } from "./services/gemini";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Links routes
  app.post('/api/links', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      let scrapedContent;
      let summary;
      let embedding;
      let category;
      let isAIAvailable = true;
      
      try {
        // Scrape content
        scrapedContent = await scrapeUrl(url);
        category = categorizeContent(scrapedContent.title, scrapedContent.content);
      } catch (scrapeError) {
        // Fallback when scraping fails
        const domain = new URL(url).hostname;
        const title = `Link from ${domain}`;
        
        scrapedContent = {
          title,
          content: `Content could not be extracted from ${url}. This link has been saved for manual review.`,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
          domain,
          readTime: "Unknown"
        };
        category = "General";
      }
      
      // Try AI processing with fallback
      try {
        summary = await generateSummary(scrapedContent.content, scrapedContent.title);
        embedding = await generateEmbedding(scrapedContent.content);
      } catch (aiError) {
        console.error("AI processing failed:", aiError);
        isAIAvailable = false;
        
        // Fallback without AI
        summary = `Link saved from ${scrapedContent.domain}. AI summarization is currently unavailable - please check your Gemini API key configuration.`;
        embedding = new Array(768).fill(0); // Zero vector for compatibility
      }
      
      // Save to database
      const link = await storage.createLink({
        userId,
        url,
        title: scrapedContent.title,
        summary,
        content: scrapedContent.content,
        favicon: scrapedContent.favicon,
        domain: scrapedContent.domain,
        category,
        readTime: scrapedContent.readTime,
        contentEmbedding: embedding,
      });

      res.json({ ...link, aiAvailable: isAIAvailable });
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process URL" 
      });
    }
  });

  app.get('/api/links', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const links = await storage.getUserLinks(userId, limit, offset);
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { q: query, limit } = searchQuerySchema.parse(req.query);
      
      try {
        // Try vector similarity search
        const searchEmbedding = await generateSearchEmbedding(query);
        const results = await storage.searchLinks(userId, searchEmbedding, limit);
        res.json(results);
      } catch (aiError) {
        // Fallback to text-based search when AI is unavailable
        console.error("AI search failed, falling back to text search:", aiError);
        const allLinks = await storage.getUserLinks(userId, 100);
        
        // Simple text matching fallback
        const filtered = allLinks.filter(link => 
          link.title.toLowerCase().includes(query.toLowerCase()) ||
          link.summary.toLowerCase().includes(query.toLowerCase()) ||
          (link.content && link.content.toLowerCase().includes(query.toLowerCase())) ||
          (link.domain && link.domain.toLowerCase().includes(query.toLowerCase()))
        );
        
        res.json(filtered.slice(0, limit));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search parameters" });
      }
      console.error("Error searching links:", error);
      res.status(500).json({ message: "Failed to search links" });
    }
  });

  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [totalLinks, thisWeek, categories] = await Promise.all([
        storage.getUserLinkCount(userId),
        storage.getUserLinksThisWeek(userId),
        storage.getUserCategories(userId),
      ]);

      res.json({
        totalLinks,
        thisWeek,
        categories: categories.length,
        searches: 0, // Could track this separately if needed
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.delete('/api/links/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const linkId = parseInt(req.params.id);
      
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }
      
      await storage.deleteLink(linkId, userId);
      res.json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
