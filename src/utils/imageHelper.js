const getImageUrl = (path) => {
    if (!path) return '';
    // If it's a full URL (from Cloudinary), return it
    if (path.startsWith('http')) {
        return path;
    }
    // Otherwise, prepend the local server URL
    // In production, this can be handled by the VITE_API_URL or a dedicated base URL
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}/${path.replace(/^\//, '')}`;
};

export default getImageUrl;
