#!/usr/bin/env node

/**
 * Rate Limit Test Script
 *
 * Tests rate limiting by making multiple requests to the API
 *
 * Usage:
 *   node scripts/test-rate-limit.js [URL] [COUNT]
 *
 * Examples:
 *   node scripts/test-rate-limit.js http://localhost:3000 15
 *   node scripts/test-rate-limit.js https://your-app.vercel.app 15
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';
const requestCount = parseInt(process.argv[3] || '15', 10);

console.log('🚀 Rate Limit Test');
console.log('━'.repeat(50));
console.log(`Target: ${baseUrl}`);
console.log(`Requests: ${requestCount}`);
console.log('━'.repeat(50));
console.log('');

const testPayload = {
  keywords: ['진간장', '간장'],
};

async function makeRequest(index) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const duration = Date.now() - startTime;
    const rateLimit = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset'),
    };

    const resetDate = rateLimit.reset
      ? new Date(parseInt(rateLimit.reset) * 1000).toLocaleTimeString('ko-KR')
      : 'N/A';

    if (response.status === 200) {
      console.log(`✅ Request ${index + 1}: SUCCESS (${duration}ms)`);
      console.log(`   Rate Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining | Reset: ${resetDate}`);
    } else if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.log(`❌ Request ${index + 1}: RATE LIMITED (${duration}ms)`);
      console.log(`   Rate Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining | Reset: ${resetDate}`);
      console.log(`   Retry After: ${retryAfter} seconds`);
    } else {
      const data = await response.json();
      console.log(`⚠️  Request ${index + 1}: ERROR ${response.status} (${duration}ms)`);
      console.log(`   Message: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`💥 Request ${index + 1}: FAILED`);
    console.log(`   Error: ${error.message}`);
  }

  console.log('');
}

async function runTest() {
  console.log('Starting test...\n');

  for (let i = 0; i < requestCount; i++) {
    await makeRequest(i);

    // Small delay between requests to see the rate limit counter decrease
    if (i < requestCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log('━'.repeat(50));
  console.log('✅ Test completed');
  console.log('━'.repeat(50));
  console.log('\n💡 Tips:');
  console.log('   - Check Upstash dashboard for analytics');
  console.log('   - Check Vercel logs for rate limit warnings');
  console.log('   - First 10 requests should succeed (200)');
  console.log('   - Remaining requests should be rate limited (429)');
}

runTest().catch(console.error);
