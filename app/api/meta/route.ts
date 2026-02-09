import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// User Agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Helper to clean price string
const cleanPrice = (str: string | null | undefined) => {
    if (!str) return null;
    // Remove non-numeric characters except dots
    const cleaned = str.replace(/[^0-9.]/g, '');
    // Remove trailing dot if present
    return cleaned.replace(/\.$/, '');
};

const fetchWithRetry = async (url: string, retries = 2): Promise<string | null> => {
    for (let i = 0; i <= retries; i++) {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Upgrade-Insecure-Requests': '1',
                    'Referer': 'https://www.google.com/'
                },
                timeout: 15000,
                maxRedirects: 5
            });
            return data;
        } catch (error) {
            if (i === retries) {
                console.error(`Failed to fetch ${url} after ${retries + 1} attempts`);
                return null;
            }
            // Wait a bit before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    return null;
};

// Domain-specific parsing logic
const parseAmazon = ($: cheerio.CheerioAPI) => {
    const price = 
        $('.a-price:not(.a-text-price) .a-offscreen').first().text().trim() ||
        $('.a-price-whole').first().text().trim() ||
        $('#priceblock_ourprice').text().trim() ||
        $('#priceblock_dealprice').text().trim() || '';
        
    const image = 
        $('#landingImage').attr('src') || 
        $('#imgBlkFront').attr('src') || 
        $('#main-image').attr('src') ||
        $('.a-dynamic-image').first().attr('src') ||
        $('.a-button-text img').first().attr('src') || '';

    return { price, image };
};

const parseFlipkart = ($: cheerio.CheerioAPI) => {
    const price = $('div[class*="_30jeq3"]').first().text().trim() || '';
    const image = $('img[class*="_396cs4"]').first().attr('src') || '';
    return { price, image };
};

const parseMyntra = ($: cheerio.CheerioAPI) => {
    // Myntra uses JSON inside script tag often
    let price = '';
    let image = '';
    
    // Try script data first
    $('script').each((_, el) => {
        const content = $(el).html() || '';
        if (content.includes('pdpData')) {
            try {
                // Extract JSON object
                const jsonMatch = content.match(/pdpData\s*=\s*({.+?});/);
                if (jsonMatch && jsonMatch[1]) {
                    const data = JSON.parse(jsonMatch[1]);
                    price = data.pdpData?.price?.discounted || data.pdpData?.price?.mrp || '';
                    image = data.pdpData?.media?.albums?.[0]?.images?.[0]?.src || '';
                }
            } catch (e) {}
        }
    });

    return { price, image };
};

const parseAjio = ($: cheerio.CheerioAPI) => {
    let price = '';
    let image = '';
    
    // Try window.__PRELOADED_STATE__
    $('script').each((_, el) => {
        const content = $(el).html() || '';
        if (content.includes('window.__PRELOADED_STATE__')) {
            try {
                const jsonMatch = content.match(/window\.__PRELOADED_STATE__\s*=\s*({.+?});/);
                if (jsonMatch && jsonMatch[1]) {
                    const data = JSON.parse(jsonMatch[1]);
                    const product = data?.product?.productDetails;
                    if (product) {
                        price = product.price?.value || product.wasPriceData?.value || '';
                        image = product.images?.[0]?.url || '';
                    }
                }
            } catch (e) {}
        }
    });
    
    return { price, image };
};

const parseMeesho = ($: cheerio.CheerioAPI) => {
    // Meesho often uses styled-components classes which change, but meta tags are reliable
    // Fallback to specific identifiable structures if possible
    const price = $('h4[class*="Price__CurrentPrice"]').text().trim() || '';
    const image = $('img[class*="ProductImage"]').attr('src') || '';
    return { price, image };
};

const parseHM = ($: cheerio.CheerioAPI) => {
    const price = 
        $('#product-price .price-value').text().trim() || 
        $('.product-item-price').first().text().trim() ||
        $('span.price-value').text().trim() || '';
            
    const image = 
        $('.product-detail-main-image-container img').first().attr('src') ||
        $('.product-detail-main-image img').first().attr('src') ||
        $('figure.pdp-image img').first().attr('src') || '';
        
    return { price, image };
};

const parseZara = ($: cheerio.CheerioAPI) => {
    const price = 
        $('.price__amount').first().text().trim() || 
        $('.product-detail-info__price-amount').text().trim() || '';
    
    // Zara images are often in a media-image class or set as background
    let image = 
        $('.media-image__image').first().attr('src') || 
        $('.product-detail-images__image').first().attr('src') || '';
        
    return { price, image };
};

const parseSavana = ($: cheerio.CheerioAPI) => {
    // Savana (Urbanic) specific
    const price = 
        $('.product-price').first().text().trim() ||
        $('div[class*="price"]').first().text().trim() || '';

    const image = 
        $('.product-image').first().attr('src') ||
        $('img[class*="gallery"]').first().attr('src') || '';

    return { price, image };
};

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const html = await fetchWithRetry(url);
        
        if (!html) {
            return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
        }

        const $ = cheerio.load(html);

        const getMeta = (name: string) => 
            $(`meta[name="${name}"]`).attr('content') || 
            $(`meta[property="${name}"]`).attr('content') || 
            $(`meta[property="og:${name}"]`).attr('content') ||
            $(`meta[property="twitter:${name}"]`).attr('content') ||
            $(`meta[itemprop="${name}"]`).attr('content');

        // Initial Extraction from Meta Tags (Universal)
        let title = getMeta('title') || $('title').text() || '';
        let image = getMeta('image');
        let price = getMeta('product:price:amount') || getMeta('price:amount') || '';

        // Domain Specific Enhancements
        const domain = new URL(url).hostname.toLowerCase();
        let specificData = { price: '', image: '' };

        if (domain.includes('amazon')) {
            specificData = parseAmazon($);
        } else if (domain.includes('flipkart')) {
            specificData = parseFlipkart($);
        } else if (domain.includes('myntra')) {
            specificData = parseMyntra($);
        } else if (domain.includes('ajio')) {
            specificData = parseAjio($);
        } else if (domain.includes('meesho')) {
            specificData = parseMeesho($);
        } else if (domain.includes('hm.com') || domain.includes('h&m')) {
            specificData = parseHM($);
        } else if (domain.includes('zara')) {
            specificData = parseZara($);
        } else if (domain.includes('savana') || domain.includes('urbanic')) {
            specificData = parseSavana($);
        }

        // Apply domain specific overrides if found
        if (specificData.price) price = specificData.price;
        if (specificData.image) image = specificData.image;

        // JSON-LD Fallback (Very reliable for most sites)
        if (!price || !image) {
             $('script[type="application/ld+json"]').each((_, el) => {
                if (price && image) return;
                try {
                    const html = $(el).html();
                    if (!html) return;
                    const json = JSON.parse(html);
                    const items = Array.isArray(json) ? json : [json];
                    const product = items.find(i => 
                        i['@type'] === 'Product' || 
                        (Array.isArray(i['@type']) && i['@type'].includes('Product'))
                    );
                  
                    if (product) {
                        if (!image && product.image) {
                            image = Array.isArray(product.image) ? product.image[0] : product.image;
                            // Handle object format {url: '...'}
                            if (typeof image === 'object' && image.url) image = image.url;
                        }
                        
                        if (!price && product.offers) {
                            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                            if (offer) {
                                price = offer.price || offer.lowPrice || offer.highPrice;
                            }
                        }
                    }
                } catch (e) {}
            });
        }

        // Generic Fallbacks
        if (!image) {
            image = $('link[rel="image_src"]').attr('href');
            if (!image) {
                // Find largest image or best candidate
                $('img').each((_, el) => {
                    const src = $(el).attr('src');
                    if (src && src.startsWith('http') && !src.includes('sprite') && !src.includes('icon') && !src.includes('logo')) {
                         // Prefer images with 'product' or 'pdp' in url
                         if (src.toLowerCase().includes('product') || src.toLowerCase().includes('pdp') || src.toLowerCase().includes('large')) {
                             image = src;
                             return false; // Found a good candidate, stop
                         }
                         // Keep the first decent image as backup if we haven't found one yet
                         if (!image) image = src;
                    }
                });
            }
        }

        // Clean up
        const finalPrice = cleanPrice(price);
        
        return NextResponse.json({
            title: title.trim(),
            image: image || '',
            price: finalPrice || '',
            url
        });

    } catch (error) {
        console.error('Error fetching metadata:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
