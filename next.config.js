// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:code',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:code',
        destination: '/:code'
      }
    ];
  }
};
