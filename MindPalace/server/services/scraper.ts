import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  content: string;
  favicon?: string;
  domain: string;
  readTime?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('h1').first().text() || 
                 'Untitled';

    // Extract main content
    let content = '';
    
    // Try various content selectors
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
      '.main-content'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    // Fallback to body content if no specific content area found
    if (!content) {
      $('script, style, nav, footer, header, .sidebar, .menu').remove();
      content = $('body').text();
    }

    // Clean up content
    content = content.replace(/\s+/g, ' ').trim();
    
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }

    // Extract favicon
    let favicon = $('link[rel="icon"]').attr('href') || 
                 $('link[rel="shortcut icon"]').attr('href') ||
                 $('link[rel="apple-touch-icon"]').attr('href');
    
    const domain = new URL(url).hostname;
    
    if (favicon && !favicon.startsWith('http')) {
      favicon = new URL(favicon, url).href;
    }

    if (!favicon) {
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    }

    // Estimate read time (average 200 words per minute)
    const wordCount = content.split(' ').length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    return {
      title: title.trim(),
      content: content,
      favicon,
      domain,
      readTime: `${readTime} min read`
    };
  } catch (error) {
    console.error('Error scraping URL:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function categorizeContent(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('react') || text.includes('javascript') || text.includes('typescript') || text.includes('programming') || text.includes('code')) {
    return 'Development';
  }
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('interface')) {
    return 'Design';
  }
  if (text.includes('business') || text.includes('startup') || text.includes('entrepreneur')) {
    return 'Business';
  }
  if (text.includes('ai') || text.includes('machine learning') || text.includes('artificial intelligence')) {
    return 'Technology';
  }
  if (text.includes('database') || text.includes('mongodb') || text.includes('sql')) {
    return 'Database';
  }
  
  return 'General';
}
