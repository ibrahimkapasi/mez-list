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

    const title = getMeta('title') || $('title').text() || '';
    const image = getMeta('image') || '';
    
    // Try to find price
    let price = getMeta('product:price:amount') || getMeta('price:amount');
    
    // Fallback for price: look for common price patterns in the body if meta fails
    if (!price) {
        // Very basic heuristic for price
        const priceRegex = /[\$₹€£]\s*[0-9,]+(\.[0-9]{2})?/;
        const bodyText = $('body').text();
        const match = bodyText.match(priceRegex);
        if (match) {
            price = match[0];
        }
    }
    
    // Add currency symbol if missing and we have a currency code
    const currency = getMeta('product:price:currency') || getMeta('price:currency');
    if (price && currency && !isNaN(Number(price))) {
        // if price is just a number, append currency
        price = `${price} ${currency}`;
    }

    return NextResponse.json({
      title: title.trim(),
      image,
      price: price ? price.trim() : 'Price not found',
      url
    });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
