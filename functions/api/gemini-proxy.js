export async function onRequestPost(context) {
    try {
        const { GEMINI_API_KEY } = context.env;
        
        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'API key not configured' 
            }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        // Parse request body safely
        let requestData;
        try {
            requestData = await context.request.json();
        } catch (parseError) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid JSON in request body' 
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const { prompt, temperature = 0.7, maxTokens = 1000 } = requestData;

        if (!prompt) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Missing prompt in request' 
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

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

        if (!response.ok) {
            console.error('Gemini API Error:', response.status, response.statusText);
            return new Response(JSON.stringify({ 
                success: false, 
                error: `Gemini API error: ${response.status}` 
            }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const data = await response.json();
        
        // Safely extract response text
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            console.error('No response text from Gemini:', data);
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'No response from AI' 
            }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        return new Response(JSON.stringify({
            success: true,
            response: responseText
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });

    } catch (error) {
        console.error('Proxy function error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
    return new Response('', {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
