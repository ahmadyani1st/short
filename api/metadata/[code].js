// api/metadata/[code].js
export default async function handler(req, res) {
  const { code } = req.query;
  
  try {
    const firebaseRes = await fetch(
      `https://jejak-mufassir-default-rtdb.firebaseio.com/shortUrls/${code}.json`
    );
    
    const data = await firebaseRes.json();
    
    res.json({
      success: true,
      data: {
        targetUrl: data?.linkproduk,
        metadata: {
          title: data?.name,
          description: data?.description,
          image: data?.image
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
