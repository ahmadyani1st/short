// pages/[code].js
import Head from 'next/head';
import { useEffect } from 'react';

export default function ShortLinkPage({ metadata, url, error }) {
  // Redirect client-side setelah 2 detik
  useEffect(() => {
    if (url) {
      setTimeout(() => {
        window.location.href = url;
      }, 2000);
    }
  }, [url]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        {/* Title */}
        <title>{metadata?.title || 'Short Link'}</title>
        <meta name="title" content={metadata?.title || 'Short Link'} />
        
        {/* Description */}
        <meta name="description" content={metadata?.description || ''} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metadata?.url || ''} />
        <meta property="og:title" content={metadata?.title || ''} />
        <meta property="og:description" content={metadata?.description || ''} />
        <meta property="og:image" content={metadata?.image || ''} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={metadata?.url || ''} />
        <meta property="twitter:title" content={metadata?.title || ''} />
        <meta property="twitter:description" content={metadata?.description || ''} />
        <meta property="twitter:image" content={metadata?.image || ''} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={metadata?.url || ''} />
      </Head>

      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>{metadata?.title || 'Redirecting...'}</h1>
        <p>{metadata?.description || ''}</p>
        
        {metadata?.image && (
          <div style={{ margin: '20px 0' }}>
            <img 
              src={metadata.image} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '400px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}
        
        <div style={{ marginTop: '30px' }}>
          <p>Redirecting to:</p>
          <a 
            href={url} 
            style={{
              color: '#0070f3',
              textDecoration: 'underline',
              wordBreak: 'break-all'
            }}
          >
            {url}
          </a>
        </div>
        
        <p style={{ marginTop: '20px', color: '#666' }}>
          If you are not redirected automatically, 
          <a href={url} style={{ marginLeft: '5px', color: '#0070f3' }}>
            click here
          </a>.
        </p>
      </div>
    </>
  );
}

// Server-Side Rendering untuk meta tags
export async function getServerSideProps(context) {
  const { code } = context.params;
  const host = context.req.headers.host;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const currentUrl = `${protocol}://${host}/${code}`;

  try {
    // Fetch data dari Firebase
    const firebaseRes = await fetch(
      `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`
    );
    
    if (!firebaseRes.ok) {
      throw new Error('Failed to fetch from Firebase');
    }
    
    const data = await firebaseRes.json();
    
    if (!data || !data.linkproduk) {
      return {
        props: {
          error: 'Short link not found',
          metadata: null,
          url: null
        }
      };
    }

    const targetUrl = data.linkproduk;
    
    // Gunakan metadata yang sudah ada di Firebase jika ada
    if (data.title || data.description || data.image) {
      return {
        props: {
          metadata: {
            title: data.title || new URL(targetUrl).hostname,
            description: data.description || `Redirecting to ${targetUrl}`,
            image: data.image || '',
            url: targetUrl
          },
          url: targetUrl,
          error: null
        }
      };
    }

    // Jika tidak ada metadata di Firebase, fetch dari target URL
    try {
      const targetRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ShortLinkBot/1.0)'
        },
        timeout: 5000
      });
      
      const html = await targetRes.text();
      
      // Fungsi extract metadata
      const extractMeta = (html, property) => {
        const regexMap = {
          'title': /<title[^>]*>([^<]+)<\/title>/i,
          'description': /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'og:title': /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'og:description': /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'og:image': /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'og:url': /<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'twitter:title': /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'twitter:description': /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
          'twitter:image': /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
        };

        const regex = regexMap[property];
        if (!regex) return '';
        
        const match = html.match(regex);
        return match ? match[1].trim() : '';
      };

      // Extract metadata dengan prioritas: OG > Twitter > Regular
      const ogTitle = extractMeta(html, 'og:title');
      const twitterTitle = extractMeta(html, 'twitter:title');
      const pageTitle = extractMeta(html, 'title');
      
      const ogDescription = extractMeta(html, 'og:description');
      const twitterDescription = extractMeta(html, 'twitter:description');
      const metaDescription = extractMeta(html, 'description');
      
      const ogImage = extractMeta(html, 'og:image');
      const twitterImage = extractMeta(html, 'twitter:image');
      
      const ogUrl = extractMeta(html, 'og:url');

      // Bangun objek metadata
      const metadata = {
        title: ogTitle || twitterTitle || pageTitle || new URL(targetUrl).hostname,
        description: ogDescription || twitterDescription || metaDescription || `Redirecting to ${targetUrl}`,
        image: ogImage || twitterImage || '',
        url: ogUrl || targetUrl
      };

      // Simpan metadata ke Firebase untuk cache
      await fetch(
        `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            title: metadata.title,
            description: metadata.description,
            image: metadata.image,
            cached_at: new Date().toISOString()
          }),
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return {
        props: {
          metadata,
          url: targetUrl,
          error: null
        }
      };

    } catch (fetchError) {
      // Fallback jika gagal fetch metadata
      console.error('Error fetching metadata:', fetchError);
      
      return {
        props: {
          metadata: {
            title: new URL(targetUrl).hostname,
            description: `Redirecting to ${targetUrl}`,
            image: '',
            url: targetUrl
          },
          url: targetUrl,
          error: null
        }
      };
    }

  } catch (error) {
    console.error('Server error:', error);
    
    return {
      props: {
        error: 'Internal server error',
        metadata: null,
        url: null
      }
    };
  }
}
