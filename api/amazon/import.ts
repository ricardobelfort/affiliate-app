import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, createHash } from 'crypto';

interface PAAPIResponse {
  ItemsResult?: {
    Items?: Array<{
      ASIN: string;
      ItemInfo?: {
        Title?: {
          DisplayValue?: string;
        };
        Features?: {
          DisplayValues?: string[];
        };
      };
      Offers?: {
        Listings?: Array<{
          Price?: {
            Amount?: number;
            DisplayAmount?: string;
          };
        }>;
      };
      Images?: {
        Primary?: {
          Large?: {
            URL?: string;
          };
        };
      };
      CustomerReviews?: {
        StarRating?: {
          Value?: number;
        };
        Count?: number;
      };
    }>;
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { asin } = req.query;

  if (!asin || typeof asin !== 'string') {
    return res.status(400).json({ error: 'ASIN is required' });
  }

  // Validar ASIN (10 caracteres alfanuméricos)
  if (!/^[A-Z0-9]{10}$/i.test(asin)) {
    return res.status(400).json({ error: 'Invalid ASIN format' });
  }

  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;

  if (!accessKey || !secretKey || !partnerTag) {
    console.error('Missing Amazon credentials in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const timestamp = new Date().toISOString();
    const payload = {
      ItemIds: [asin],
      PartnerTag: partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'Images.Primary.Large',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ]
    };

    const headers = await generateHeaders(payload, timestamp, accessKey, secretKey);
    
    const response = await fetch('https://webservices.amazon.com/paapi5/getitems', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PA-API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch from Amazon',
        details: errorText 
      });
    }

    const data = await response.json() as PAAPIResponse;

    if (data.Errors && data.Errors.length > 0) {
      console.error('PA-API Errors:', data.Errors);
      return res.status(400).json({ 
        error: 'Amazon API error',
        details: data.Errors 
      });
    }

    if (!data.ItemsResult?.Items || data.ItemsResult.Items.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const item = data.ItemsResult.Items[0];
    
    const productData = {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || '',
      price: item.Offers?.Listings?.[0]?.Price?.Amount,
      imageUrl: item.Images?.Primary?.Large?.URL,
      rating: item.CustomerReviews?.StarRating?.Value,
      reviewCount: item.CustomerReviews?.Count,
      features: item.ItemInfo?.Features?.DisplayValues
    };

    return res.status(200).json(productData);

  } catch (error) {
    console.error('Error fetching Amazon product data:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateHeaders(
  payload: any, 
  timestamp: string, 
  accessKey: string, 
  secretKey: string
): Promise<Record<string, string>> {
  const payloadString = JSON.stringify(payload);
  const payloadHash = sha256(payloadString);
  
  const host = 'webservices.amazon.com';
  const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
  
  const canonicalHeaders = [
    `content-type:application/json; charset=utf-8`,
    `host:${host}`,
    `x-amz-date:${formatTimestamp(timestamp)}`,
    `x-amz-target:${target}`
  ].join('\n');

  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
  
  const canonicalRequest = [
    'POST',
    '/paapi5/getitems',
    '',
    canonicalHeaders,
    '',
    signedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = getCredentialScope(timestamp);
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    formatTimestamp(timestamp),
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n');

  const signature = await calculateSignature(timestamp, stringToSign, secretKey);
  
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Host': host,
    'X-Amz-Date': formatTimestamp(timestamp),
    'X-Amz-Target': target,
    'Authorization': authorization
  };
}

function formatTimestamp(timestamp: string): string {
  return timestamp.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function getCredentialScope(timestamp: string): string {
  const date = timestamp.substring(0, 10).replace(/-/g, '');
  return `${date}/us-east-1/ProductAdvertisingAPI/aws4_request`;
}

async function calculateSignature(timestamp: string, stringToSign: string, secretKey: string): Promise<string> {
  const date = timestamp.substring(0, 10).replace(/-/g, '');
  const kDate = createHmac('sha256', `AWS4${secretKey}`).update(date).digest();
  const kRegion = createHmac('sha256', kDate).update('us-east-1').digest();
  const kService = createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  
  return signature;
}

function sha256(message: string): string {
  return createHash('sha256').update(message).digest('hex');
}
