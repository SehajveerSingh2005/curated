const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded']
    ],
  },
});

const FEEDS = [
  { url: 'https://www.gq.com/feed/rss', source: 'GQ' },
  { url: 'https://www.vogue.com/feed/rss', source: 'Vogue' },
  { url: 'https://hypebeast.com/feed', source: 'Hypebeast' },
  { url: 'https://fashionista.com/.rss/full/', source: 'Fashionista' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml', source: 'NYT Fashion' },
  { url: 'https://www.elle.com/rss/all.xml/', source: 'Elle' },
  { url: 'https://www.harpersbazaar.com/rss/all.xml/', source: 'Harper\'s Bazaar' },
  { url: 'https://www.whowhatwear.com/rss', source: 'Who What Wear' },
  { url: 'https://www.thezoereport.com/rss', source: 'The Zoe Report' },
  { url: 'https://www.vogue.in/feed/rss', source: 'Vogue India' },
  { url: 'https://www.gqindia.com/feed/rss', source: 'GQ India' }
];

const FASHION_WHITELIST = [
  'fashion', 'style', 'trend', 'outfit', 'wear', 'runway', 'designer', 'collection', 'wardrobe', 'dress', 
  'apparel', 'shoes', 'sneaker', 'lookbook', 'streetwear', 'garment', 'tailoring', 'couture', 'menswear', 'womenswear',
  'accessories', 'luxury', 'editorial', 'modeling', 'textiles', 'vogue', 'gq', 'hypebeast'
];

let cachedFeed = [];
let lastFetchedTime = 0;
const CACHE_DURATION = 15 * 60 * 1000;

const fetchAndCacheFeeds = async () => {
  const allItems = [];
  
  const feedPromises = FEEDS.map(async (feed) => {
    try {
      const parsedData = await parser.parseURL(feed.url);
      
      parsedData.items.forEach(item => {
        let imageUrl = null;
        const isAdUrl = (u) => !u || u.includes('doubleclick.net') || u.includes('gampad') || u.includes('pixel') || u.includes('adsystem');

        if (item.mediaContent && item.mediaContent.length > 0) {
          for (let mc of item.mediaContent) {
            if (mc && mc.$ && mc.$.url && !isAdUrl(mc.$.url)) {
              imageUrl = mc.$.url;
              break;
            }
          }
        }
        
        if (!imageUrl && item.mediaThumbnail && item.mediaThumbnail.length > 0) {
          for (let mt of item.mediaThumbnail) {
            if (mt && mt.$ && mt.$.url && !isAdUrl(mt.$.url)) {
              imageUrl = mt.$.url;
              break;
            }
          }
        }

        if (!imageUrl && item.enclosure && item.enclosure.url && !isAdUrl(item.enclosure.url)) {
          imageUrl = item.enclosure.url;
        }

        if (!imageUrl) {
          const content = item.contentEncoded || item.content || '';
          const imgRegex = /<img[^>]+src="([^">]+)"/i;
          const match = content.match(imgRegex);
          if (match && !isAdUrl(match[1])) imageUrl = match[1];
        }

        if (!imageUrl) return;

        if (item.title && item.title.toLowerCase().includes("hulu renews 'the testaments'")) {
          return;
        }

        const categoryStrings = (item.categories || []).map(c => {
          if (typeof c === 'string') return c;
          if (c && typeof c === 'object') {
            if (typeof c._ === 'string') return c._;
            if (typeof c.name === 'string') return c.name;
          }
          return '';
        }).filter(Boolean);

        const searchString = `${item.title || ''} ${item.contentSnippet || ''} ${categoryStrings.join(' ')}`.toLowerCase();
        const isFashionRelated = FASHION_WHITELIST.some(kw => searchString.includes(kw));

        if (!isFashionRelated) return;

        // Filter tags against whitelist
        const tags = categoryStrings
          .map(c => c.toLowerCase())
          .filter(t => FASHION_WHITELIST.some(kw => t.includes(kw)))
          .filter(t => t.length > 2 && t.length < 20);
        
        allItems.push({
          _id: item.guid || item.link || Math.random().toString(),
          title: item.title,
          link: item.link,
          imageUrl: imageUrl,
          pubDate: item.pubDate || new Date().toISOString(),
          author: item.creator || feed.source,
          source: feed.source,
          tags: tags.length > 0 ? tags.slice(0, 3) : ['editorial'],
        });
      });
    } catch (error) {
      console.error(`Error fetching feed ${feed.url}:`, error.message);
    }
  });

  await Promise.all(feedPromises);

  const seenIds = new Set();
  const uniqueItems = allItems.filter(item => {
    if (seenIds.has(item._id)) return false;
    seenIds.add(item._id);
    return true;
  }).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  cachedFeed = uniqueItems;
  lastFetchedTime = Date.now();
  return uniqueItems;
};

// Initial boot fetch
fetchAndCacheFeeds().catch(err => console.error("Initial background fetch failed:", err.message));

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tagFilter = req.query.tag ? req.query.tag.toLowerCase() : null;
    
    // Serve from cache if available
    if (cachedFeed.length === 0 || (now - lastFetchedTime > CACHE_DURATION)) {
      const fetchPromise = fetchAndCacheFeeds();
      if (cachedFeed.length === 0) {
        await fetchPromise;
      }
    }

    // Extract common tags from the ENTIRE cache for stable filtering
    const tagCounts = {};
    cachedFeed.forEach(item => {
      item.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const commonTags = Object.entries(tagCounts)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag.charAt(0).toUpperCase() + tag.slice(1))
      .slice(0, 20);

    // Apply filtering
    let filteredItems = cachedFeed;
    if (tagFilter && tagFilter !== 'all') {
      filteredItems = cachedFeed.filter(item => 
        item.tags.some(t => t.toLowerCase() === tagFilter)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const items = filteredItems.slice(startIndex, endIndex);

    res.json({
      data: items,
      tags: commonTags,
      pagination: {
        total: filteredItems.length,
        page,
        limit,
        pages: Math.ceil(filteredItems.length / limit),
        hasMore: endIndex < filteredItems.length
      }
    });
  } catch (error) {
    console.error('Error in feed route:', error);
    res.status(500).json({ message: 'Error fetching discover feed' });
  }
});

module.exports = router;
