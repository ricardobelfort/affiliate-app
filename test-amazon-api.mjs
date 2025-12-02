// Test script to validate Amazon API function locally
import { createHmac, createHash } from 'crypto';

const accessKey = 'AKPADG590G1764679499';
const secretKey = 'Y6XdpKBzZ3Mn0/nfiAU6LA19Df8PtZpprXd4Vop0';
const partnerTag = 'friendlypr0bb-20';

async function testAmazonAPI(asin) {
  console.log('Testing with ASIN:', asin);
  
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

  const headers = generateHeaders(payload, timestamp, accessKey, secretKey);
  
  console.log('Request Headers:', headers);
  console.log('Request Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('https://webservices.amazon.com/paapi5/getitems', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function generateHeaders(payload, timestamp, accessKey, secretKey) {
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

  const signature = calculateSignature(timestamp, stringToSign, secretKey);
  
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Host': host,
    'X-Amz-Date': formatTimestamp(timestamp),
    'X-Amz-Target': target,
    'Authorization': authorization
  };
}

function formatTimestamp(timestamp) {
  return timestamp.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function getCredentialScope(timestamp) {
  const date = timestamp.substring(0, 10).replace(/-/g, '');
  return `${date}/us-east-1/ProductAdvertisingAPI/aws4_request`;
}

function calculateSignature(timestamp, stringToSign, secretKey) {
  const date = timestamp.substring(0, 10).replace(/-/g, '');
  const kDate = createHmac('sha256', `AWS4${secretKey}`).update(date).digest();
  const kRegion = createHmac('sha256', kDate).update('us-east-1').digest();
  const kService = createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  
  return signature;
}

function sha256(message) {
  return createHash('sha256').update(message).digest('hex');
}

// Test with a known ASIN
testAmazonAPI('B08N5WRWNW').catch(console.error);
