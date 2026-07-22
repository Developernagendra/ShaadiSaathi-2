fetch('http://localhost:5002/api/auth/test-email').then(res => res.json()).then(console.log).catch(console.error);
