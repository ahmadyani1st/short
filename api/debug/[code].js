// api/debug/[code].js
export default async function handler(req, res) {
  const { code } = req.query;
  
  const firebaseData = await fetch(
    `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`
  ).then(r => r.json());
  
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debug: ${code}</title>
      <style>
        body { font-family: monospace; padding: 20px; }
        .data { background: #f5f5f5; padding: 20px; margin: 10px 0; }
        pre { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>Debug Data for ${code}</h1>
      <div class="data">
        <h3>Firebase Data:</h3>
        <pre>${JSON.stringify(firebaseData, null, 2)}</pre>
      </div>
      <div class="data">
        <h3>OG Tags that will be shown:</h3>
        <pre>
og:title = "${firebaseData?.title || 'Not set'}"
og:description = "${firebaseData?.description || 'Not set'}"
og:image = "${firebaseData?.image || 'Not set'}"
        </pre>
      </div>
      <p><a href="/${code}" target="_blank">View Short Link</a></p>
      <p><a href="https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(`https://${req.headers.host}/${code}`)}" target="_blank">Test on Facebook Debugger</a></p>
    </body>
    </html>
  `);
}
