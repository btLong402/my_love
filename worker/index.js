/**
 * Cloudflare Worker for R2 Image Storage
 * Handles upload, delete, and list operations
 */

export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Upload image
            if (request.method === 'POST' && path === '/upload') {
                return await handleUpload(request, env, corsHeaders);
            }

            // Delete image
            if (request.method === 'DELETE' && path.startsWith('/delete/')) {
                const key = path.replace('/delete/', '');
                return await handleDelete(key, env, corsHeaders);
            }

            // List all images
            if (request.method === 'GET' && path === '/list') {
                return await handleList(env, corsHeaders);
            }

            // Get single image
            if (request.method === 'GET' && path.startsWith('/image/')) {
                const key = path.replace('/image/', '');
                return await handleGet(key, env, corsHeaders);
            }

            // Health check
            if (request.method === 'GET' && path === '/') {
                return new Response(JSON.stringify({ status: 'ok', message: 'My Love R2 Worker' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

// Handle image upload
async function handleUpload(request, env, corsHeaders) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const key = `images/${timestamp}-${randomId}.${extension}`;

    // Upload to R2
    await env.MY_BUCKET.put(key, file.stream(), {
        httpMetadata: {
            contentType: file.type,
        },
    });

    // Return the public URL
    // Note: You need to set up public access for your bucket or use a custom domain
    const publicUrl = `https://${env.MY_BUCKET.name}.r2.cloudflarestorage.com/${key}`;

    return new Response(JSON.stringify({
        success: true,
        key: key,
        url: `/image/${key}`,  // Relative URL through worker
        filename: file.name
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Handle image deletion
async function handleDelete(key, env, corsHeaders) {
    await env.MY_BUCKET.delete(key);

    return new Response(JSON.stringify({ success: true, deleted: key }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Handle listing all images
async function handleList(env, corsHeaders) {
    const listed = await env.MY_BUCKET.list({ prefix: 'images/' });

    const images = listed.objects.map(obj => ({
        key: obj.key,
        url: `/image/${obj.key}`,
        size: obj.size,
        uploaded: obj.uploaded
    }));

    return new Response(JSON.stringify({ images }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Handle getting a single image
async function handleGet(key, env, corsHeaders) {
    const object = await env.MY_BUCKET.get(key);

    if (!object) {
        return new Response('Image not found', { status: 404, headers: corsHeaders });
    }

    const headers = new Headers(corsHeaders);
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new Response(object.body, { headers });
}
