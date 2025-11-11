#!/usr/bin/env node

/**
 * Backend API Test Script
 * Tests all endpoints to verify they work correctly
 */

const BASE_URL = 'http://localhost:8080';

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');

  // Test 1: Health Check
  console.log('1️⃣  Testing Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Event Suggestions
  console.log('\n2️⃣  Testing Event Suggestions...');
  try {
    const response = await fetch(`${BASE_URL}/api/events/suggest?keyword=Lakers`);
    const data = await response.json();
    console.log(`✅ Suggestions found: ${data._embedded?.attractions?.length || 0} results`);
  } catch (error) {
    console.log('❌ Suggestions failed:', error.message);
  }

  // Test 3: Event Search
  console.log('\n3️⃣  Testing Event Search...');
  try {
    const response = await fetch(`${BASE_URL}/api/events/search?keyword=music&lat=34.0522&lng=-118.2437&radius=10`);
    const data = await response.json();
    console.log(`✅ Search found: ${data._embedded?.events?.length || 0} events`);
    if (data._embedded?.events?.[0]) {
      console.log(`   First event: ${data._embedded.events[0].name}`);
    }
  } catch (error) {
    console.log('❌ Event search failed:', error.message);
  }

  // Test 4: Artist Search
  console.log('\n4️⃣  Testing Artist Search (Spotify)...');
  try {
    const response = await fetch(`${BASE_URL}/api/artists/search?keyword=Taylor Swift`);
    const data = await response.json();
    console.log(`✅ Artist found: ${data.name || 'N/A'}`);
    console.log(`   Followers: ${data.followers?.total || 0}`);
  } catch (error) {
    console.log('❌ Artist search failed:', error.message);
  }

  // Test 5: Get Favorites
  console.log('\n5️⃣  Testing Get Favorites...');
  try {
    const response = await fetch(`${BASE_URL}/api/favorites`);
    const data = await response.json();
    console.log(`✅ Favorites retrieved: ${data.length} events`);
  } catch (error) {
    console.log('❌ Get favorites failed:', error.message);
  }

  console.log('\n✨ Test suite completed!\n');
}

// Run tests
testAPI().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});