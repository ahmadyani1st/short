// api/[code].js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code } = req.query;
  
  try {
    // Fetch data dari Firebase
    const firebaseUrl = `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`;
    const response = await fetch(firebaseUrl);
    const data = await response.json();
    
    if (!data || !data.linkproduk) {
      return res.status(404).json({ error: 'Short link not found' });
    }
    
    // Jika sudah ada metadata di Firebase, langsung kembalikan
    if (data.name || data.description || data.image) {
      return res.json({
        url: data.linkproduk,
        title: data.name || '',
        description: data.description || '',
        image: data.image || ''
      });
    }
    
    // Fetch metadata dari link tujuan
    const targetUrl = data.linkproduk;
    const htmlResponse = await fetch(targetUrl);
    const html = await htmlResponse.text();
    
    // Parse metadata dari HTML
    const metadata = {
      url: targetUrl,
      title: extractMetaTag(html, 'title'),
      description: extractMetaTag(html, 'description') || 
                   extractMetaTag(html, 'og:description') || 
                   extractMetaTag(html, 'twitter:description'),
      image: extractMetaTag(html, 'og:image') || 
             extractMetaTag(html, 'twitter:image') ||
             extractMetaTag(html, 'image')
    };
    
    // Simpan metadata ke Firebase (optional)
    await fetch(`https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: metadata.title,
        description: metadata.description,
        image: metadata.image
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json(metadata);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function extractMetaTag(html, property) {
  const regexMap = {
    'title': /<title>(.*?)<\/title>/i,
    'description': /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
    'og:description': /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i,
    'twitter:description': /<meta[^>]*name="twitter:description"[^>]*content="([^"]*)"[^>]*>/i,
    'og:image': /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i,
    'twitter:image': /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i,
    'image': /<meta[^>]*name="image"[^>]*content="([^"]*)"[^>]*>/i
  };
  
  const regex = regexMap[property];
  if (!regex) return '';
  
  const match = html.match(regex);
  return match ? match[1] : '';
}
