/**
 * Secure API Proxy for Gemini AI
 * This should be deployed to a serverless function (Vercel, Netlify, or similar)
 * to securely handle API requests without exposing the API key
 */

// For Vercel deployment
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate request origin (replace with your domain)
    const allowedOrigins = [
        'https://kopiahhaji.github.io',
        'http://localhost:3000', // For development
        'http://localhost:8080'  // For development
    ];
    
    const origin = req.headers.origin;
    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: 'Forbidden origin' });
    }

    try {
        // Get API key from environment variable (secure!)
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Extract request data
        const { prompt, temperature = 0.7, maxTokens = 1000 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Call Gemini API securely from server
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Return the response to client
        res.status(200).json({
            success: true,
            response: data.candidates[0]?.content?.parts[0]?.text || 'No response generated'
        });

    } catch (error) {
        console.error('API Proxy Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process request' 
        });
    }
}
