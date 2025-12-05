// Cloudflare Worker untuk Short Link dengan OG Tags
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Ambil URL dan path
  const url = new URL(request.url)
  const path = url.pathname
  
  // Debug: tampilkan info jika di root
  if (path === '/' || path === '') {
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head><title>Short Link Worker</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h1>✅ Worker Berhasil Dibuat!</h1>
        <p>URL Worker Anda: ${request.url}</p>
        <p>Untuk test, tambahkan kode short di belakang URL:</p>
        <p>Contoh: <a href="${request.url}zbkg6f">${request.url}zbkg6f</a></p>
        <hr>
        <h3>Testing:</h3>
        <p><a href="${request.url}test123">Test 1</a> | <a href="${request.url}zbkg6f">Test 2</a></p>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }
  
  // Ambil kode short (hapus slash di depan)
  const shortCode = path.replace(/^\//, '')
  
  // Log untuk debugging
  console.log(`Mencari short code: ${shortCode}`)
  
  try {
    // 1. Ambil data dari Firebase
    const firebaseUrl = `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${shortCode}.json`
    console.log(`Fetching: ${firebaseUrl}`)
    
    const firebaseResponse = await fetch(firebaseUrl)
    
    if (!firebaseResponse.ok) {
      console.log('Firebase response not OK')
      return showError(`Short code "${shortCode}" tidak ditemukan di database`)
    }
    
    const data = await firebaseResponse.json()
    console.log('Data dari Firebase:', data)
    
    // 2. Cek jika data ada
    if (!data) {
      return showError(`Data untuk "${shortCode}" kosong`)
    }
    
    // 3. Pastikan ada linkproduk
    const targetUrl = data.linkproduk
    if (!targetUrl) {
      return showError('Link tujuan (linkproduk) tidak ditemukan')
    }
    
    // 4. Ambil data untuk OG tags
    const ogTitle = data.name || 'Buku Beyond The Inspiration'
    const ogDescription = data.description || 'Buku Beyond The Inspiration merupakan rujukan yang sangat baik bagi umat Islam'
    const ogImage = data.image || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhSmej7x_CxfZ6uv2lOESsm1ZzGU7MtsGnWtFdhCDDGaIbSsHles2ErbrWuIIbTay-PFd1dJ6tLXSh10vFgN5IPxlmfn9nGqTT8YU1j3T96VQzyb5Nfr_0ePHL0OzM76y2E3JHEfiAX0r06MX8Bw5b0XnQ2BGNbVgEE7X75UgkOs-iM0ERim6umGQaTeRir/w0/Beyond%20The%20Inspiration;%2099K%20-%20450gr.jpg'
    
    // 5. Buat HTML dengan OG tags
    const html = createHTMLPage(ogTitle, ogDescription, ogImage, targetUrl, shortCode)
    
    // 6. Return response
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // Cache 5 menit
      },
      status: 200
    })
    
  } catch (error) {
    console.error('Error:', error)
    return showError(`Terjadi error: ${error.message}`)
  }
}

// Fungsi buat HTML page dengan OG tags
function createHTMLPage(title, description, image, url, shortCode) {
  // Encode untuk keamanan HTML
  const encode = (str) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
  
  const safeTitle = encode(title)
  const safeDesc = encode(description)
  const safeImage = encode(image)
  const safeUrl = encode(url)
  
  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${safeTitle}</title>
    <meta name="title" content="${safeTitle}">
    <meta name="description" content="${safeDesc}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:image:alt" content="${safeTitle}">
    <meta property="og:site_name" content="Jejak Mufassir">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${safeUrl}">
    <meta property="twitter:title" content="${safeTitle}">
    <meta property="twitter:description" content="${safeDesc}">
    <meta property="twitter:image" content="${safeImage}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${safeUrl}">
    
    <!-- Auto-redirect setelah 0 detik -->
    <meta http-equiv="refresh" content="0;url=${safeUrl}">
    
    <!-- Fallback JavaScript redirect -->
    <script>
        window.onload = function() {
            window.location.href = "${safeUrl}";
        }
        // Redirect langsung kalau bisa
        setTimeout(function() {
            window.location.href = "${safeUrl}";
        }, 100);
    </script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            text-align: center;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        h1 {
            font-size: 28px;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            margin: 30px auto;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .url-box {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
        }
        
        .btn {
            display: inline-block;
            background: #FFDD40;
            color: #333;
            padding: 12px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .debug {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 12px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${safeTitle}</h1>
        <p>${safeDesc}</p>
        
        <div class="spinner"></div>
        
        <p>Mengarahkan ke halaman tujuan...</p>
        
        <div class="url-box">
            ${safeUrl}
        </div>
        
        <a href="${safeUrl}" class="btn">Klik di sini untuk lanjut</a>
        
        <div class="debug">
            Short Code: ${shortCode}<br>
            Worker: Cloudflare Short Link<br>
            Waktu: ${new Date().toLocaleTimeString('id-ID')}
        </div>
    </div>
</body>
</html>`
}

// Fungsi tampilkan error
function showError(message) {
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Error - Short Link</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          text-align: center;
          background: #f8f9fa;
          color: #333;
        }
        .error-box {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: 0 auto;
        }
        h1 { color: #dc3545; }
      </style>
    </head>
    <body>
      <div class="error-box">
        <h1>⚠️ Error</h1>
        <p>${message}</p>
        <hr>
        <p><small>Periksa:</small></p>
        <ul style="text-align: left; display: inline-block;">
          <li>Kode short URL benar</li>
          <li>Data ada di Firebase</li>
          <li>Format data sesuai</li>
        </ul>
        <p><a href="/">Kembali ke Home</a></p>
      </div>
    </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 404
    }
  )
}
