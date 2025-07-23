export async function onRequestPost(context) {
    try {
        const { GEMINI_API_KEY } = context.env;
        
        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'API key not configured' 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const requestData = await context.request.json();
        const { prompt, temperature = 0.7, maxTokens = 1000 } = requestData;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { 
                    temperature, 
                    maxOutputTokens: maxTokens 
                }
            })
        });

        const data = await response.json();
        
        return new Response(JSON.stringify({
            success: true,
            response: data.candidates[0]?.content?.parts[0]?.text || 'No response'
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to process request' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
