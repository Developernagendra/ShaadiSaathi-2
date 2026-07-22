const http = require('http');

const SERVER_URL = 'http://127.0.0.1:5000';
const rand = Date.now();

const USER_CREDENTIALS = {
  name: `Audit User ${rand}`,
  email: `audit.user.${rand}@example.com`,
  password: 'Password@123',
  phone: `99${String(rand).substring(5)}`,
  role: 'user'
};

const VENDOR_CREDENTIALS = {
  name: `Audit Vendor ${rand}`,
  email: `audit.vendor.${rand}@example.com`,
  password: 'Password@123',
  phone: `88${String(rand).substring(5)}`,
  role: 'vendor',
  vendorType: 'service'
};

let userToken = '';
let vendorToken = '';
let serviceId = '';

async function fetchAPI(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: endpoint,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ status: 500, error: e.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('🚀 Starting ShaadiSaathi E2E API Audit...');

  // 1. Health Check
  console.log('\n--- 1. Health Check ---');
  let res = await fetchAPI('/api/health');
  if (res.status === 200 && res.data.success) {
    console.log('✅ API Health OK');
  } else {
    console.log('❌ API Health Failed', res);
    return;
  }

  // 2. User Registration
  console.log('\n--- 2. User Registration ---');
  res = await fetchAPI('/api/auth/register', 'POST', USER_CREDENTIALS);
  if (res.status === 201 && res.data.token) {
    userToken = res.data.token;
    console.log('✅ User Registration OK');
  } else {
    console.log('❌ User Registration Failed', res);
  }

  // 3. User Login
  console.log('\n--- 3. User Login ---');
  res = await fetchAPI('/api/auth/login', 'POST', {
    email: USER_CREDENTIALS.email,
    password: USER_CREDENTIALS.password
  });
  if (res.status === 200 && res.data.token) {
    console.log('✅ User Login OK');
  } else {
    console.log('❌ User Login Failed', res);
  }

  // 4. Vendor Registration
  console.log('\n--- 4. Vendor Registration ---');
  res = await fetchAPI('/api/auth/register', 'POST', VENDOR_CREDENTIALS);
  if (res.status === 201 && res.data.token) {
    vendorToken = res.data.token;
    console.log('✅ Vendor Registration OK');
  } else {
    console.log('❌ Vendor Registration Failed', res);
  }

  // 5. Check Categories
  console.log('\n--- 5. Categories Check ---');
  res = await fetchAPI('/api/categories');
  let catId = null;
  if (res.status === 200 && res.data.data.length > 0) {
    catId = res.data.data[0]._id;
    console.log(`✅ Categories OK (Found ${res.data.data.length}, using ${catId})`);
  } else {
    console.log('❌ Categories Failed or Empty', res);
  }

  // 6. Vendor Profile Update
  console.log('\n--- 6. Vendor Profile Update ---');
  res = await fetchAPI('/api/vendors/profile', 'PUT', {
    businessName: 'Audit Test Business',
    description: 'A test business for auditing',
    city: 'Mumbai',
    category: catId
  }, vendorToken);
  
  if (res.status === 200) {
    console.log('✅ Vendor Profile Update OK');
  } else {
    console.log('❌ Vendor Profile Update Failed', JSON.stringify(res, null, 2));
  }

  // 7. Create Service
  console.log('\n--- 7. Create Service ---');
  res = await fetchAPI('/api/services', 'POST', {
    title: 'Audit Photography Service',
    description: 'We take great photos.',
    price: 50000,
    startingPrice: 50000,
    category: catId,
    city: 'Mumbai',
    images: [{ url: 'https://example.com/img.jpg', viewType: 'front' }]
  }, vendorToken);
  
  if (res.status === 201 && res.data.data) {
    serviceId = res.data.data._id;
    console.log('✅ Create Service OK', serviceId);
  } else {
    console.log('❌ Create Service Failed', JSON.stringify(res, null, 2));
  }

  // 8. Create Booking
  if (serviceId && userToken) {
    console.log('\n--- 8. Create Booking ---');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    res = await fetchAPI('/api/bookings', 'POST', {
      serviceId: serviceId,
      eventDate: futureDate.toISOString(),
      eventTime: 'Morning',
      eventVenue: 'Taj Hotel',
      eventCity: 'Mumbai',
      guestCount: 200,
      contactName: 'Test User',
      contactPhone: '9876543210',
      amount: 50000
    }, userToken);
    
    if (res.status === 201) {
      console.log('✅ Create Booking OK', res.data.data.bookingId);
    } else {
      console.log('❌ Create Booking Failed', JSON.stringify(res, null, 2));
    }
  }

  console.log('\n🏁 Audit Test Script Completed.');
}

runAudit();
