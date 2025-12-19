// Node 18+ has native fetch

const API_URL = 'http://localhost:3000';
let token = '';
let testNovelSlug = '';
let testNovelId = '';
let userId = '';

async function runTest() {
  console.log('--- STARTING BACKEND FLOW TEST ---');

  // 1. Get New Novels (Public)
  console.log('\n1. Testing GET /novels/new...');
  try {
    const res = await fetch(`${API_URL}/novels/new`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length > 0) {
      console.log('✅ SUCCESS: Fetched ' + data.length + ' novels.');
      testNovelSlug = data[0].slug;
      testNovelId = data[0]._id;
      console.log(`   Target Novel: ${data[0].title} (Slug: ${testNovelSlug})`);
    } else {
      console.error('❌ FAILED: Could not fetch novels or empty list.', data);
      return;
    }
  } catch (e) {
    console.error('❌ FAILED: Network error fetching novels.', e.message);
    return;
  }

  // 2. Get Novel Details (Public)
  console.log(`\n2. Testing GET /novels/${testNovelSlug}...`);
  try {
    const res = await fetch(`${API_URL}/novels/${testNovelSlug}`);
    const data = await res.json();
    if (res.status === 200 && data.slug === testNovelSlug) {
      console.log('✅ SUCCESS: Fetched novel details.');
    } else {
      console.error('❌ FAILED: Could not fetch novel detail.', data);
    }
  } catch (e) {
    console.error('❌ FAILED:', e.message);
  }

  // 3. Register Test User
  const randomUser = 'user_' + Math.floor(Math.random() * 10000);
  const userPayload = {
    username: randomUser,
    password: 'password123',
    email: `${randomUser}@test.com`
  };
  console.log(`\n3. Testing POST /auth/register (User: ${randomUser})...`);
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });
    const data = await res.json();
    if (res.status === 201 && data.access_token) {
        console.log('✅ SUCCESS: Registered and got token.');
        token = data.access_token;
        userId = data.user._id;
    } else {
        console.error('❌ FAILED: Register failed.', data);
    }
  } catch (e) {
    console.error('❌ FAILED:', e.message);
  }

  // 4. Test Auth Guard (Check Follow status)
  if (token) {
      console.log(`\n4. Testing Secured API (GET /follows/check/${testNovelId})...`);
      try {
        const res = await fetch(`${API_URL}/follows/check/${testNovelId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.status === 200) {
            console.log('✅ SUCCESS: Auth Guard passed. Data:', data);
        } else {
            console.error('❌ FAILED: Auth Guard rejected or error.', res.status, data);
        }
      } catch (e) {
        console.error('❌ FAILED:', e.message);
      }
  } else {
      console.log('\n⚠️ SKIPPING Auth tests because registration failed.');
  }

  // 5. Get Comments (Public)
  console.log(`\n5. Testing GET /comments/novel/${testNovelId}...`);
  try {
      const res = await fetch(`${API_URL}/comments/novel/${testNovelId}`);
      const data = await res.json();
      if (res.status === 200 && Array.isArray(data)) {
          console.log(`✅ SUCCESS: Fetched ${data.length} comments.`);
      } else {
          console.error('❌ FAILED: Fetch comments failed.', data);
      }
  } catch (e) {
      console.error('❌ FAILED:', e.message);
  }

  console.log('\n--- TEST COMPLETE ---');
}

runTest();
