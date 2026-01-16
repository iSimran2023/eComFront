
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment from eComBack
dotenv.config({ path: path.join(__dirname, '..', 'eComBack', '.env') });

// Mock Cloudinary if needed
if (!process.env.CLOUDINARY_URL) {
    process.env.CLOUDINARY_URL = 'cloudinary://mock:mock@mock';
}

const app = require('../eComBack/server.js');

const PORT = 5002;
const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`http://localhost:${PORT}/api/products?featured=true`);
        const text = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log('Response Body:', text.substring(0, 300));
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        server.close();
        process.exit(0);
    }
});
