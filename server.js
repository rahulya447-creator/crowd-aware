import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for OSRM
app.get('/api/route', async (req, res) => {
    try {
        const { coordinates } = req.query;

        if (!coordinates) {
            return res.status(400).json({ error: 'Missing coordinates parameter' });
        }

        // Try multiple OSRM endpoints (Prioritize German server as it's more reliable)
        const endpoints = [
            `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
            `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        ];

        for (const osrmUrl of endpoints) {
            try {
                console.log(`Proxying request to: ${osrmUrl}`);

                // Add User-Agent to avoid being blocked
                const response = await fetch(osrmUrl, {
                    headers: {
                        'User-Agent': 'CrowdAwareApp/1.0'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.code === 'Ok') {
                        return res.json(data);
                    }
                }
                console.warn(`Endpoint failed: ${osrmUrl} - ${response.status}`);
            } catch (err) {
                console.warn(`Endpoint error: ${osrmUrl}`, err.message);
            }
        }

        throw new Error('All OSRM endpoints failed');
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch route from OSRM' });
    }
});

app.listen(PORT, () => {
    console.log(`
  🚀 OSRM Proxy Server running on http://localhost:${PORT}
  
  Endpoints:
  - GET /api/route?coordinates={lng},{lat};{lng},{lat}
  `);
});
