import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

// Function to get absolute URL
function resolveUrl(baseUrl, relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl;
  if (relativeUrl.startsWith('//')) return `https:${relativeUrl}`;
  
  const base = new URL(baseUrl);
  if (relativeUrl.startsWith('/')) {
    return `${base.protocol}//${base.host}${relativeUrl}`;
  }
  return `${base.protocol}//${base.host}/${relativeUrl}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Add a user agent to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = await response.text();
    
    // Parse HTML using node-html-parser
    const root = parse(html);

    // Try different meta tags in order of preference
    let imageUrl = null;

    // OpenGraph
    if (!imageUrl) {
      const ogImage = root.querySelector('meta[property="og:image"]');
      imageUrl = ogImage?.getAttribute('content');
    }

    // OpenGraph secure
    if (!imageUrl) {
      const ogImageSecure = root.querySelector('meta[property="og:image:secure_url"]');
      imageUrl = ogImageSecure?.getAttribute('content');
    }

    // Twitter Card
    if (!imageUrl) {
      const twitterImage = root.querySelector('meta[name="twitter:image"]') || 
                          root.querySelector('meta[name="twitter:image:src"]');
      imageUrl = twitterImage?.getAttribute('content');
    }

    // Schema.org
    if (!imageUrl) {
      const schemaImage = root.querySelector('meta[itemprop="image"]');
      imageUrl = schemaImage?.getAttribute('content');
    }

    // Article image
    if (!imageUrl) {
      const articleImage = root.querySelector('meta[property="article:image"]');
      imageUrl = articleImage?.getAttribute('content');
    }

    // Look for largest image on the page
    if (!imageUrl) {
      const images = root.querySelectorAll('img')
        .map(img => ({
          src: img.getAttribute('src'),
          width: parseInt(img.getAttribute('width') || '0'),
          height: parseInt(img.getAttribute('height') || '0'),
          area: parseInt(img.getAttribute('width') || '0') * parseInt(img.getAttribute('height') || '0')
        }))
        .filter(img => {
          const src = img.src;
          return src && 
                 !src.includes('logo') && 
                 !src.includes('icon') &&
                 img.area > 10000; // Minimum size threshold
        })
        .sort((a, b) => b.area - a.area);

      if (images.length > 0) {
        imageUrl = images[0].src;
      }
    }

    // Try preview service if no image found
    if (!imageUrl) {
      try {
        const previewResponse = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(url)}`
        );
        if (previewResponse.ok) {
          const previewData = await previewResponse.json();
          if (previewData.data?.image?.url) {
            imageUrl = previewData.data.image.url;
          }
        }
      } catch (error) {
        console.log('Preview service failed, continuing with fallback...');
      }
    }

    // Make relative URLs absolute
    if (imageUrl) {
      imageUrl = resolveUrl(url, imageUrl);
    }

    // If still no image, use favicon as last resort
    if (!imageUrl) {
      imageUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
    }

    return NextResponse.json({ 
      image: imageUrl,
      hostname: new URL(url).hostname
    });

  } catch (error) {
    console.error('Error fetching link preview:', error);
    // Return favicon as fallback in case of error
    const hostname = new URL(url).hostname;
    return NextResponse.json({ 
      image: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      hostname: hostname,
      fallback: true
    }, { status: 200 }); // Still return 200 with fallback image
  }
}