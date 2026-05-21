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
  { url: 'https://www.popsugar.com/fashion/feed', source: 'Popsugar' },
  { url: 'https://www.vogue.in/feed/rss', source: 'Vogue India' },
  { url: 'https://www.gqindia.com/feed/rss', source: 'GQ India' }
];

let cachedFeed = null;
let lastFetchedTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const checkImageExists = async (url) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    const isValid = response.ok;
    if (response.body) {
      await response.body.cancel().catch(() => {});
    }
    return isValid;
  } catch (err) {
    return false;
  }
};

const fetchAndCacheFeeds = async () => {
  const allItems = [];
  
  const feedPromises = FEEDS.map(async (feed) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );
      
      const parsedData = await Promise.race([
        parser.parseURL(feed.url),
        timeoutPromise
      ]);
      
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

        if (!imageUrl && item.enclosure && item.enclosure.url && !isAdUrl(item.enclosure.url) && item.enclosure.url.match(/\.(jpeg|jpg|gif|png|webp)/)) {
          imageUrl = item.enclosure.url;
        }

        if (!imageUrl) {
          const content = item.contentEncoded || item.content || '';
          const imgRegex = /<img[^>]+src="([^">]+)"/i;
          const match = content.match(imgRegex);
          if (match && !isAdUrl(match[1])) imageUrl = match[1];
        }

        const categoryStrings = (item.categories || []).map(c => {
          if (typeof c === 'string') return c;
          if (c && typeof c === 'object') {
            if (typeof c._ === 'string') return c._;
            if (typeof c.name === 'string') return c.name;
          }
          return '';
        }).filter(Boolean);

        // Strict fashion filter
        const searchString = `${item.title || ''} ${item.contentSnippet || ''} ${categoryStrings.join(' ')}`.toLowerCase();
        const fashionKeywords = [
          'fashion', 'style', 'trend', 'outfit', 'wear', 'runway', 'designer', 'collection', 'wardrobe', 'dress', 
          'apparel', 'shoes', 'sneaker', 'lookbook', 'streetwear', 'garment', 'tailoring', 'couture', 'menswear', 'womenswear', 'vogue', 'gq',
          'met gala', 'fashion week', 'red carpet', 'awards', 'exhibition', 'beauty'
        ];
        
        const isFashionRelated = fashionKeywords.some(kw => searchString.includes(kw));
        
        // Must be fashion related and MUST have a valid native image
        if (!isFashionRelated || !imageUrl) return;

        const tags = categoryStrings.slice(0, 3).map(c => c.toLowerCase());
        const filteredTags = tags.filter(t => t && fashionKeywords.some(kw => t.includes(kw))).slice(0, 3);
        
        if (filteredTags.length === 0) {
          filteredTags.push('editorial', 'trends');
        }
        
        allItems.push({
          _id: item.guid || item.link || Math.random().toString(),
          title: item.title,
          link: item.link,
          imageUrl: imageUrl,
          pubDate: item.pubDate || new Date().toISOString(),
          author: item.creator || feed.source,
          source: feed.source,
          tags: filteredTags,
        });
      });
    } catch (error) {
      console.error(`Error fetching feed ${feed.url}:`, error.message);
    }
  });  await Promise.all(feedPromises);

  // Filter out duplicate articles
  const seenIds = new Set();
  const uniqueItems = [];
  for (const item of allItems) {
    if (!item._id) continue;
    if (!seenIds.has(item._id)) {
      seenIds.add(item._id);
      uniqueItems.push(item);
    }
  }

  // Sort unique items by publication date descending
  uniqueItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Batch validate image existence to get exactly 150 valid items
  const finalItems = [];
  const BATCH_SIZE = 25;
  let index = 0;

  while (finalItems.length < 150 && index < uniqueItems.length) {
    const batch = uniqueItems.slice(index, index + BATCH_SIZE);
    index += BATCH_SIZE;

    const validationPromises = batch.map(async (item) => {
      const isValid = await checkImageExists(item.imageUrl);
      return isValid ? item : null;
    });

    const results = await Promise.all(validationPromises);

    for (const item of results) {
      if (item) {
        finalItems.push(item);
        if (finalItems.length >= 150) {
          break;
        }
      }
    }
  }
  
  cachedFeed = finalItems;
  lastFetchedTime = Date.now();
  return finalItems;
};

// Initial background fetch on server boot
fetchAndCacheFeeds().catch(err => console.error("Initial background fetch failed:", err.message));

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // 1. If cache is fresh, return immediately
    if (cachedFeed && (now - lastFetchedTime < CACHE_DURATION)) {
      return res.json(cachedFeed);
    }
    
    // 2. If cache is stale but exists, return immediately and update in background
    if (cachedFeed) {
      fetchAndCacheFeeds().catch(err => console.error("Background feed revalidation failed:", err.message));
      return res.json(cachedFeed);
    }
    
    // 3. First request fallback: fetch synchronously
    const data = await fetchAndCacheFeeds();
    res.json(data);
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).json({ message: 'Error fetching discover feed' });
  }
});

module.exports = router;
