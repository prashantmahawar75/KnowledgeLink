import {
  users,
  links,
  type User,
  type UpsertUser,
  type Link,
  type InsertLink,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Link operations
  createLink(link: InsertLink): Promise<Link>;
  getUserLinks(userId: string, limit?: number, offset?: number): Promise<Link[]>;
  getLinkById(id: number, userId: string): Promise<Link | undefined>;
  deleteLink(id: number, userId: string): Promise<void>;
  searchLinks(userId: string, embedding: number[], limit?: number): Promise<Link[]>;
  getUserLinkCount(userId: string): Promise<number>;
  getUserLinksThisWeek(userId: string): Promise<number>;
  getUserCategories(userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Link operations
  async createLink(linkData: InsertLink): Promise<Link> {
    const [link] = await db
      .insert(links)
      .values(linkData)
      .returning();
    return link;
  }

  async getUserLinks(userId: string, limit = 20, offset = 0): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getLinkById(id: number, userId: string): Promise<Link | undefined> {
    const [link] = await db
      .select()
      .from(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)));
    return link;
  }

  async deleteLink(id: number, userId: string): Promise<void> {
    await db
      .delete(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)));
  }

  async searchLinks(userId: string, embedding: number[], limit = 20): Promise<Link[]> {
    const embeddingString = `[${embedding.join(',')}]`;
    
    return await db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(sql`content_embedding <-> ${embeddingString}::vector`)
      .limit(limit);
  }

  async getUserLinkCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(links)
      .where(eq(links.userId, userId));
    return result[0]?.count || 0;
  }

  async getUserLinksThisWeek(userId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(links)
      .where(and(
        eq(links.userId, userId),
        sql`created_at >= ${weekAgo}`
      ));
    return result[0]?.count || 0;
  }

  async getUserCategories(userId: string): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: links.category })
      .from(links)
      .where(and(eq(links.userId, userId), sql`category IS NOT NULL`));
    
    return result.map(r => r.category).filter(Boolean) as string[];
  }
}

export const storage = new DatabaseStorage();
