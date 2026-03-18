exports.handler = async (event) => {
  const ALLOWED_ORIGIN = 'https://portail-client.nevios.fr';

  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }

  const TOKEN   = process.env.NOCODB_TOKEN;
  const BASE    = process.env.NOCODB_BASE_URL;

  if (!TOKEN || !BASE) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { path = '', query = '', method = 'GET', data } = payload;
  const url = `${BASE}${path}${query ? '?' + query : ''}`;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'xc-token': TOKEN, 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
