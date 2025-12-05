import Head from 'next/head';
import { useEffect } from 'react';

export default function ShortLinkPage({ 
  firebaseData, 
  targetUrl, 
  error,
  ogImage,
  ogTitle,
  ogDescription
}) {
  
  // Redirect client-side
  useEffect(() => {
    if (targetUrl) {
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1500);
    }
  }, [targetUrl]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Prioritaskan data dari Firebase
  const title = firebaseData?.title || ogTitle || 'Short Link';
  const description = firebaseData?.description || ogDescription || '';
  const image = firebaseData?.image || ogImage || '';
  
  // URL canonical - gunakan target URL, bukan shortlink URL
  const canonicalUrl = targetUrl || '';

  return (
    <>
      <Head>
        {/* Title - HANYA dari Firebase */}
        <title>{title}</title>
        <meta name="title" content={title} />
        
        {/* Description - HANYA dari Firebase */}
        <meta name="description" content={description} />
        
        {/* ===== OPEN GRAPH TAGS ===== */}
        {/* TYPE */}
        <meta property="og:type" content="website" />
        
        {/* URL - INI YANG PENTING: gunakan target URL */}
        <meta property="og:url" content={canonicalUrl} />
        
        {/* TITLE - HANYA dari Firebase */}
        <meta property="og:title" content={title} />
        
        {/* DESCRIPTION - HANYA dari Firebase */}
        <meta property="og:description" content={description} />
        
        {/* IMAGE - HANYA dari Firebase */}
        <meta property="og:image" content={image} />
        {image && (
          <>
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
          </>
        )}
        
        {/* SITE NAME - kosongkan atau beri nama Anda */}
        <meta property="og:site_name" content="" />
        
        {/* ===== TWITTER CARDS ===== */}
        <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {/* ===== META LAINNYA ===== */}
        {/* HINDARI meta viewport di Head untuk Facebook */}
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Canonical URL ke target */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Prev/Next kosong untuk hindari pagination */}
        <link rel="prev" href="" />
        <link rel="next" href="" />
        
        {/* Hapus semua meta yang tidak perlu */}
      </Head>

      {/* VIEWPORT HANYA di HTML Body */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Structured Data minimal */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": canonicalUrl,
            ...(image && { "image": image })
          })
        }}
      />

      {/* Konten halaman */}
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        
        {/* Logo/Site Name - minimalis */}
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginBottom: '30px',
          fontWeight: 'normal'
        }}>
          Redirecting...
        </div>
        
        {/* Title */}
        <h1 style={{ 
          fontSize: '28px', 
          lineHeight: '1.3',
          marginBottom: '20px',
          color: '#333'
        }}>
          {title}
        </h1>
        
        {/* Description */}
        <p style={{ 
          fontSize: '18px', 
          lineHeight: '1.6',
          color: '#555',
          marginBottom: '30px',
          maxWidth: '600px'
        }}>
          {description}
        </p>
        
        {/* Image Preview */}
        {image && (
          <div style={{ 
            margin: '30px 0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <img 
              src={image} 
              alt={title}
              style={{ 
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Target URL */}
        <div style={{ 
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '10px'
          }}>
            You are being redirected to:
          </p>
          <a 
            href={targetUrl}
            style={{
              fontSize: '16px',
              color: '#0070f3',
              wordBreak: 'break-all',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = targetUrl;
            }}
          >
            {targetUrl}
          </a>
        </div>
        
        {/* Manual Redirect Button */}
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={() => window.location.href = targetUrl}
            style={{
              padding: '12px 32px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051a8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
          >
            Continue to Website
          </button>
        </div>
        
        {/* Countdown */}
        <div style={{ 
          marginTop: '20px',
          fontSize: '14px',
          color: '#888'
        }}>
          Redirecting in <span id="countdown">2</span> seconds...
        </div>
      </div>

      {/* Countdown Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          let seconds = 2;
          const countdownEl = document.getElementById('countdown');
          const timer = setInterval(() => {
            seconds--;
            if (countdownEl) countdownEl.textContent = seconds;
            if (seconds <= 0) {
              clearInterval(timer);
              window.location.href = '${targetUrl}';
            }
          }, 1000);
        `
      }} />
    </>
  );
}

// ===== SERVER SIDE RENDERING =====
export async function getServerSideProps(context) {
  const { code } = context.params;
  const host = context.req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const currentShortUrl = `${protocol}://${host}/${code}`;

  try {
    // 1. FETCH DATA DARI FIREBASE
    const firebaseRes = await fetch(
      `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`,
      { timeout: 5000 }
    );
    
    if (!firebaseRes.ok) throw new Error('Firebase fetch failed');
    
    const firebaseData = await firebaseRes.json();
    
    // Validasi data
    if (!firebaseData || !firebaseData.linkproduk) {
      return {
        props: {
          error: 'Short link not found',
          firebaseData: null,
          targetUrl: null,
          ogTitle: null,
          ogDescription: null,
          ogImage: null
        }
      };
    }

    const targetUrl = firebaseData.linkproduk;
    
    // 2. EXTRACT DATA DARI FIREBASE (PRIORITAS UTAMA)
    const firebaseTitle = firebaseData.title || '';
    const firebaseDescription = firebaseData.description || '';
    const firebaseImage = firebaseData.image || '';
    
    // 3. FALLBACK: Ambil dari target URL JIKA data Firebase kosong
    let ogTitle = firebaseTitle;
    let ogDescription = firebaseDescription;
    let ogImage = firebaseImage;
    
    // Hanya fetch dari target jika data Firebase tidak lengkap
    const needsFetch = !firebaseTitle || !firebaseDescription || !firebaseImage;
    
    if (needsFetch) {
      try {
        const targetRes = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FacebookBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
          },
          timeout: 3000
        });
        
        const html = await targetRes.text();
        
        // Simple extractor
        const extractMeta = (html, property) => {
          const patterns = {
            'og:title': /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
            'twitter:title': /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
            'title': /<title[^>]*>([^<]+)<\/title>/i,
            'og:description': /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
            'twitter:description': /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
            'description': /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
            'og:image': /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
            'twitter:image': /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
          };
          
          const pattern = patterns[property];
          if (!pattern) return '';
          const match = html.match(pattern);
          return match ? match[1].trim() : '';
        };
        
        // Priority: Firebase > OG > Twitter > Regular
        ogTitle = firebaseTitle || 
                 extractMeta(html, 'og:title') || 
                 extractMeta(html, 'twitter:title') || 
                 extractMeta(html, 'title') || 
                 new URL(targetUrl).hostname;
        
        ogDescription = firebaseDescription || 
                       extractMeta(html, 'og:description') || 
                       extractMeta(html, 'twitter:description') || 
                       extractMeta(html, 'description') || 
                       `Visit ${new URL(targetUrl).hostname}`;
        
        ogImage = firebaseImage || 
                 extractMeta(html, 'og:image') || 
                 extractMeta(html, 'twitter:image') || 
                 '';
        
        // Update Firebase jika ada data baru
        if ((!firebaseTitle && ogTitle) || (!firebaseDescription && ogDescription) || (!firebaseImage && ogImage)) {
          await fetch(
            `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                title: ogTitle,
                description: ogDescription,
                image: ogImage,
                last_updated: new Date().toISOString()
              })
            }
          );
        }
        
      } catch (fetchError) {
        console.log('Using Firebase data only, fetch failed:', fetchError.message);
      }
    }

    // 4. RETURN PROPS
    return {
      props: {
        firebaseData: {
          title: ogTitle,
          description: ogDescription,
          image: ogImage
        },
        targetUrl,
        ogTitle,
        ogDescription,
        ogImage,
        error: null
      }
    };

  } catch (error) {
    console.error('SSR Error:', error);
    
    return {
      props: {
        error: 'Failed to load short link',
        firebaseData: null,
        targetUrl: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null
      }
    };
  }
}
