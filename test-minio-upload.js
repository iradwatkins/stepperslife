/**
 * Test MinIO Upload Functionality
 * Run with: node test-minio-upload.js
 */

const Minio = require('minio');
const fs = require('fs');
const path = require('path');

// Load environment variables - use production for testing
require('dotenv').config({ path: '.env.production' });

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'stepperslife';

async function testMinIO() {
  console.log('🧪 Testing MinIO Connection...\n');
  console.log('Configuration:');
  console.log(`  Endpoint: ${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`);
  console.log(`  Bucket: ${BUCKET_NAME}`);
  console.log(`  SSL: ${process.env.MINIO_USE_SSL === 'true'}\n`);

  try {
    // Step 1: Check if bucket exists
    console.log('1️⃣ Checking if bucket exists...');
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!exists) {
      console.log('   Bucket does not exist. Creating...');
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      
      // Set public read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log('   ✅ Bucket created with public read access');
    } else {
      console.log('   ✅ Bucket exists');
    }

    // Step 2: Create a test file
    console.log('\n2️⃣ Creating test file...');
    const testContent = `Test upload at ${new Date().toISOString()}`;
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(testFilePath, testContent);
    console.log(`   ✅ Test file created: ${testFileName}`);

    // Step 3: Upload test file
    console.log('\n3️⃣ Uploading test file...');
    const objectName = `test-uploads/${testFileName}`;
    await minioClient.fPutObject(BUCKET_NAME, objectName, testFilePath, {
      'Content-Type': 'text/plain'
    });
    console.log(`   ✅ File uploaded as: ${objectName}`);

    // Step 4: Generate presigned URL
    console.log('\n4️⃣ Generating presigned URL...');
    const presignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, objectName, 7 * 24 * 60 * 60);
    console.log(`   ✅ Presigned URL: ${presignedUrl.substring(0, 100)}...`);

    // Step 5: List objects in bucket
    console.log('\n5️⃣ Listing objects in bucket...');
    const stream = minioClient.listObjects(BUCKET_NAME, '', true);
    const objects = [];
    
    stream.on('data', obj => objects.push(obj));
    stream.on('end', () => {
      console.log(`   ✅ Found ${objects.length} objects in bucket`);
      if (objects.length > 0) {
        console.log('   Recent objects:');
        objects.slice(-5).forEach(obj => {
          console.log(`     - ${obj.name} (${obj.size} bytes)`);
        });
      }
    });
    stream.on('error', err => {
      console.error('   ❌ Error listing objects:', err);
    });

    // Clean up test file
    setTimeout(() => {
      fs.unlinkSync(testFilePath);
      console.log('\n🧹 Cleaned up test file');
      console.log('\n✅ MinIO is working correctly!');
      console.log('You can now upload images through the application.');
    }, 2000);

  } catch (error) {
    console.error('\n❌ MinIO Test Failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MinIO is running on your server');
    console.error('2. Check the endpoint and credentials in .env.development');
    console.error('3. Ensure the MinIO port (9000) is accessible');
    console.error('4. For production, update MINIO_ENDPOINT to your server IP');
  }
}

// Run the test
testMinIO();