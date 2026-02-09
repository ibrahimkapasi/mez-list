import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);

    const getMeta = (name: string) => 
      $(`meta[name="${name}"]`).attr('content') || 
      $(`meta[property="${name}"]`).attr('content') || 
      $(`meta[property="og:${name}"]`).attr('content') ||
      $(`meta[property="twitter:${name}"]`).attr('content');

    // Helper to clean price string
    const cleanPrice = (str: string) => {
      if (!str) return null;
      // Remove commas, currency symbols (non-digits/non-dots)
      // Be careful not to remove the decimal point
      const cleaned = str.replace(/[^0-9.]/g, '');
      // Remove trailing dot if present (Amazon often leaves "999.")
      return cleaned.replace(/\.$/, '');
    };

    let price = '';
    let currency = 'INR'; // Default to INR as requested

    // 1. Try JSON-LD (Best for accurate pricing)
    try {
      $('script[type="application/ld+json"]').each((_, el) => {
        if (price) return; // Stop if found
        try {
            const html = $(el).html();
            if (!html) return;
            const json = JSON.parse(html);
            
            // Handle array of objects or single object
            const items = Array.isArray(json) ? json : [json];
            
            // Find Product entity
            const product = items.find(i => 
                i['@type'] === 'Product' || 
                (Array.isArray(i['@type']) && i['@type'].includes('Product'))
            );
          
            if (product && product.offers) {
                const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                if (offer) {
                    // Prioritize lowPrice for ranges, then price
                    const p = offer.price || offer.lowPrice || offer.highPrice;
                    const c = offer.priceCurrency;
                    if (p) {
                        price = p.toString();
                        if (c) currency = c;
                    }
                }
            }
        } catch (e) {
          // Ignore json parse errors
        }
      });
    } catch (e) {
      console.log('JSON-LD parsing failed', e);
    }

    // 2. Try Meta tags if JSON-LD failed
    if (!price) {
        price = getMeta('product:price:amount') || 
                getMeta('price:amount') || 
                '';
        const curr = getMeta('product:price:currency') || getMeta('price:currency');
        if (curr) currency = curr;
    }

    // 3. Fallback to specific selectors for common Indian sites (Flipkart, Amazon)
    if (!price) {
       // Amazon India
       // Strategy: Look for the main price block, avoiding the strike-through "text-price" (MRP)
       // .a-price identifies a price block. .a-text-price is usually the MRP (strike-through).
       // We want the one that is NOT .a-text-price.
       const amazonMainPrice = $('.a-price:not(.a-text-price) .a-offscreen').first().text().trim();
       if (amazonMainPrice) {
           price = amazonMainPrice;
       } else {
           // Fallback to old selector if the smart one fails
           const amazonFallback = $('.a-price-whole').first().text().trim();
           if (amazonFallback) price = amazonFallback;
       }

       // Flipkart
       // _30jeq3 is the main price class. _16Jk6d is often combined with it on product pages.
       const flipkartPrice = $('div[class*="_30jeq3"]').first().text().trim(); 
       if (flipkartPrice) price = flipkartPrice;
       
       // Myntra/generic fallback
       if (!price) {
         // Try to find something that looks like a price near the title? Hard to do generically.
         // Just simple fallback
         const p = $('[class*="price"]').first().text();
         if (p && p.match(/[0-9]/)) {
            // Be careful with this, might pick up garbage.
         }
       }
    }

    // Final clean up
    const cleanedPrice = cleanPrice(price);
    
    // Format final price string
    let finalPrice = '';
    if (cleanedPrice) {
        // If currency is USD/EUR etc, we might want to keep it, but user asked for Rupee symbol.
        // We just return the number and let frontend handle formatting with Rupee.
        finalPrice = cleanedPrice;
    }

    const title = getMeta('title') || $('title').text() || '';
    const image = getMeta('image') || '';

    return NextResponse.json({
      title: title.trim(),
      image,
      price: finalPrice || '',
      url
    });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
