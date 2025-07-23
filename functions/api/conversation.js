// Cloudflare Pages Function for Conversation KV Storage
// This handles saving and loading conversation history

export async function onRequestPost(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    try {
        // Handle different endpoints
        if (pathname.endsWith('/conversation/save')) {
            return await handleSaveConversation(request, env, corsHeaders);
        } else if (pathname.endsWith('/conversation/load')) {
            return await handleLoadConversation(request, env, corsHeaders);
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: "Endpoint not found",
                message: "Sila gunakan /api/conversation/save atau /api/conversation/load"
            }), {
                status: 404,
                headers: corsHeaders
            });
        }
    } catch (error) {
        console.error('Conversation API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    try {
        if (url.pathname.endsWith('/conversation/load')) {
            return await handleLoadConversation(request, env, corsHeaders);
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: "Endpoint not found",
                message: "Sila gunakan /api/conversation/load"
            }), {
                status: 404,
                headers: corsHeaders
            });
        }
    } catch (error) {
        console.error('Conversation API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function onRequestOptions(context) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

async function handleSaveConversation(request, env, corsHeaders) {
    try {
        const requestData = await request.json();
        const { userId, conversation } = requestData;

        if (!userId || !conversation) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing userId or conversation data'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Check if KV namespace is available
        if (!env.USTAZ_CONVERSATIONS) {
            console.log('KV namespace not available, using fallback response');
            return new Response(JSON.stringify({
                success: true,
                message: 'KV not configured, using localStorage fallback',
                fallback: true
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

        // Save to Cloudflare KV
        const conversationData = {
            ...conversation,
            lastUpdated: Date.now(),
            version: 1
        };

        await env.USTAZ_CONVERSATIONS.put(
            `conversation:${userId}`, 
            JSON.stringify(conversationData),
            {
                expirationTtl: 60 * 60 * 24 * 30 // 30 days
            }
        );

        return new Response(JSON.stringify({
            success: true,
            message: 'Conversation saved successfully',
            timestamp: conversationData.lastUpdated
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Save conversation error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to save conversation',
            details: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

async function handleLoadConversation(request, env, corsHeaders) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing userId parameter'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Check if KV namespace is available
        if (!env.USTAZ_CONVERSATIONS) {
            console.log('KV namespace not available, returning not found');
            return new Response(JSON.stringify({
                success: true,
                found: false,
                message: 'KV not configured, use localStorage fallback',
                fallback: true
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

        // Load from Cloudflare KV
        const conversationData = await env.USTAZ_CONVERSATIONS.get(
            `conversation:${userId}`, 
            'json'
        );

        if (conversationData) {
            return new Response(JSON.stringify({
                success: true,
                found: true,
                conversation: conversationData,
                loadedAt: Date.now()
            }), {
                status: 200,
                headers: corsHeaders
            });
        } else {
            return new Response(JSON.stringify({
                success: true,
                found: false,
                message: 'No conversation found for this user'
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

    } catch (error) {
        console.error('Load conversation error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to load conversation',
            details: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
