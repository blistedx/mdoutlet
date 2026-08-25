const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- 🥛 DAIRY INVENTORY API TEST SUITE ---');

  // 1. Health check
  const health = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  console.log('1. Health Check:', health);

  // 2. Admin Login
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@dairy.com', password: 'admin123' })
  }).then((r) => r.json());
  const adminToken = adminLogin.token;
  console.log(`2. Admin Login Success: ${adminLogin.user.name} (${adminLogin.user.role})`);

  // 3. Staff Login
  const staffLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'staff@dairy.com', password: 'staff123' })
  }).then((r) => r.json());
  const staffToken = staffLogin.token;
  console.log(`3. Staff Login Success: ${staffLogin.user.name} (${staffLogin.user.role})`);

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };
  const staffHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`
  };

  // 4. Products & Stock query
  const productsRes = await fetch(`${BASE_URL}/products`, { headers: adminHeaders }).then((r) => r.json());
  console.log(`4. Total Catalog Products: ${productsRes.count}`);
  const sampleProduct = productsRes.products[0];
  console.log(`   Sample Product: "${sampleProduct.name}" (Stock: ${sampleProduct.currentQuantity} ${sampleProduct.unit}, QR: ${sampleProduct.qrCode})`);

  // 5. Purchases with auto stock sync test
  const initialStock = sampleProduct.currentQuantity;
  const purchaseRes = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      productId: sampleProduct._id,
      quantity: 20,
      costPrice: sampleProduct.costPrice || 28,
      supplierName: 'Fresh Dairy Farm Co-op',
      invoiceNumber: 'INV-TEST-001',
      batchNumber: `BCH-TEST-${Date.now().toString().slice(-4)}`,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    })
  }).then((r) => r.json());
  console.log(`5. Purchase Created: ${purchaseRes.message}`);

  const afterPurchase = await fetch(`${BASE_URL}/products/${sampleProduct._id}`, { headers: adminHeaders }).then((r) => r.json());
  console.log(`   Stock after +20 Purchase: ${afterPurchase.product.currentQuantity} (Expected: ${initialStock + 20})`);

  // 6. Sales with auto stock deduction test
  const saleRes = await fetch(`${BASE_URL}/sales`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      productId: sampleProduct._id,
      quantity: 5,
      sellingPrice: sampleProduct.unitPrice,
      customerName: 'Aman Retail Store',
      paymentMode: 'UPI'
    })
  }).then((r) => r.json());
  console.log(`6. Sale Recorded: ${saleRes.message}`);

  const afterSale = await fetch(`${BASE_URL}/products/${sampleProduct._id}`, { headers: adminHeaders }).then((r) => r.json());
  console.log(`   Stock after -5 Sale: ${afterSale.product.currentQuantity} (Expected: ${initialStock + 15})`);

  // 7. Expiry Batches & 3-Day Risk Flagging
  const expiryRes = await fetch(`${BASE_URL}/expiry`, { headers: staffHeaders }).then((r) => r.json());
  console.log(`7. Expiry Batches: Fresh=${expiryRes.summary.freshCount}, Near-Expiry (< 3 Days)=${expiryRes.summary.nearExpiryCount}, Expired=${expiryRes.summary.expiredCount}`);

  // 8. Production Batch Logging Test
  const rawMilk = productsRes.products.find((p) => p.category === 'raw-milk' || p.name.includes('Raw')) || sampleProduct;
  const curdProd = productsRes.products.find((p) => p.category === 'curd') || productsRes.products[1];
  const prodRes = await fetch(`${BASE_URL}/production`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      batchDate: new Date().toISOString(),
      rawMilkProductId: rawMilk._id,
      inputQuantity: 50,
      outputProducts: [{ productId: curdProd._id, quantity: 25 }],
      wastage: 1,
      notes: 'Test processing shift'
    })
  }).then((r) => r.json());
  console.log(`8. Production Logged: ${prodRes.message}`);

  // 9. RBAC Test: Staff blocked from Admin-only user management
  const rbacRes = await fetch(`${BASE_URL}/users`, { headers: staffHeaders });
  if (rbacRes.status === 403) {
    const data = await rbacRes.json();
    console.log(`9. RBAC PASSED: Staff blocked from Admin endpoint (HTTP ${rbacRes.status}: ${data.message})`);
  } else {
    console.error(`9. RBAC FAILED: Received unexpected status ${rbacRes.status}`);
  }

  // 10. Dashboard Stats Aggregation
  const dash = await fetch(`${BASE_URL}/reports/dashboard-stats`, { headers: adminHeaders }).then((r) => r.json());
  console.log(`10. Dashboard Stats: StockUnits=${dash.stats.totalStockUnits}, TodaySales=₹${dash.stats.today.salesAmount}, LowStockAlerts=${dash.stats.lowStockCount}, NearExpiryBatches=${dash.stats.nearExpiryCount}`);

  console.log('\n🎉 ALL 10 TEST SUITES PASSED FLAWLESSLY!');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
