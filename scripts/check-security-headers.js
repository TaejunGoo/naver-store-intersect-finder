#!/usr/bin/env node

/**
 * Security Headers Checker
 *
 * Verifies that security headers are properly configured
 *
 * Usage:
 *   node scripts/check-security-headers.js [URL]
 *
 * Examples:
 *   node scripts/check-security-headers.js http://localhost:3000
 *   node scripts/check-security-headers.js https://your-app.vercel.app
 */

const url = process.argv[2] || 'http://localhost:3000';

const EXPECTED_HEADERS = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': [
    "default-src 'self'",
    'script-src',
    'style-src',
    'img-src',
    'font-src',
    'connect-src',
    'frame-ancestors',
    'base-uri',
    'form-action',
  ],
};

async function checkHeaders() {
  console.log('🔒 Security Headers Checker');
  console.log('━'.repeat(60));
  console.log(`URL: ${url}`);
  console.log('━'.repeat(60));
  console.log('');

  try {
    const response = await fetch(url);
    const headers = response.headers;

    let passCount = 0;
    let failCount = 0;

    // Check each expected header
    for (const [headerName, expectedValue] of Object.entries(EXPECTED_HEADERS)) {
      const actualValue = headers.get(headerName);

      if (!actualValue) {
        console.log(`❌ ${headerName}`);
        console.log(`   Missing header`);
        console.log('');
        failCount++;
        continue;
      }

      // Special handling for CSP
      if (headerName === 'content-security-policy') {
        const missingDirectives = [];
        for (const directive of expectedValue) {
          if (!actualValue.includes(directive)) {
            missingDirectives.push(directive);
          }
        }

        if (missingDirectives.length > 0) {
          console.log(`⚠️  ${headerName}`);
          console.log(`   Missing directives: ${missingDirectives.join(', ')}`);
          console.log(`   Actual: ${actualValue.substring(0, 100)}...`);
          console.log('');
          failCount++;
        } else {
          console.log(`✅ ${headerName}`);
          console.log(`   ${actualValue.substring(0, 80)}...`);
          console.log('');
          passCount++;
        }
        continue;
      }

      // Check if value matches (case-insensitive)
      if (actualValue.toLowerCase() === expectedValue.toLowerCase()) {
        console.log(`✅ ${headerName}`);
        console.log(`   ${actualValue}`);
        console.log('');
        passCount++;
      } else {
        console.log(`⚠️  ${headerName}`);
        console.log(`   Expected: ${expectedValue}`);
        console.log(`   Actual: ${actualValue}`);
        console.log('');
        failCount++;
      }
    }

    // Summary
    console.log('━'.repeat(60));
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('━'.repeat(60));

    if (failCount === 0) {
      console.log('');
      console.log('🎉 All security headers are properly configured!');
    } else {
      console.log('');
      console.log('⚠️  Some security headers are missing or incorrect.');
      console.log('');
      console.log('💡 Tips:');
      console.log('   1. Make sure the dev server is running (npm run dev)');
      console.log('   2. Check next.config.ts headers configuration');
      console.log('   3. Restart the server after config changes');
    }

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.log('');
    console.log('💥 Error checking headers');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Make sure the server is running');
    console.log('   - Check the URL is correct');
    console.log('   - Try: npm run dev');
    process.exit(1);
  }
}

checkHeaders();
