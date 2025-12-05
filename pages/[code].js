// pages/[code].js
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function ShortLinkPage() {
  const router = useRouter();
  const { code } = router.query;
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    async function fetchMetadata() {
      try {
        const res = await fetch(`/api/${code}`);
        const data = await res.json();
        setMetadata(data);
        
        // Redirect ke URL tujuan setelah 2 detik
        setTimeout(() => {
          if (data.url) {
            window.location.href = data.url;
          }
        }, 2000);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, [code]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{metadata?.title || 'Short Link'}</title>
        <meta name="description" content={metadata?.description || ''} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={metadata?.title || ''} />
        <meta property="og:description" content={metadata?.description || ''} />
        <meta property="og:image" content={metadata?.image || ''} />
        <meta property="og:url" content={`https://yourdomain.com/${code}`} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata?.title || ''} />
        <meta name="twitter:description" content={metadata?.description || ''} />
        <meta name="twitter:image" content={metadata?.image || ''} />
      </Head>

      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{metadata?.title || 'Redirecting...'}</h1>
        <p>{metadata?.description || ''}</p>
        {metadata?.image && (
          <img 
            src={metadata.image} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        )}
        <p>Redirecting to: {metadata?.url}</p>
        <p>If you are not redirected automatically, 
          <a href={metadata?.url}> click here</a>.
        </p>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { code } = context.params;
  
  try {
    // Fetch metadata di server side untuk SEO
    const res = await fetch(`https://yourdomain.com/api/${code}`);
    const metadata = await res.json();
    
    return {
      props: {
        metadata
      }
    };
  } catch (error) {
    return {
      props: {
        metadata: null
      }
    };
  }
}
