export const fetchMetadata = async (url) => {
  try {
    let title = "Saved Link";
    let thumbnail = null;
    let domain = '';
    
    try {
      domain = new URL(url).hostname;
    } catch(e) {
      domain = url;
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];
        thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        // In a production app, we would use YouTube Data API to fetch the real title.
        title = "YouTube Video"; 
      }
    } else if (url.includes('instagram.com/reel/')) {
        title = "Instagram Reel";
    }

    return { title, thumbnail, domain };
  } catch (e) {
    console.error("Failed to parse URL metadata", e);
    return { title: "Invalid Link", thumbnail: null, domain: null };
  }
};
