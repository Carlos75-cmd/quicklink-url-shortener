// Script para crear planes de PayPal via API
// Ejecutar con: node create-paypal-plans.js

const CLIENT_ID = 'Aev84IB12Q1N3-92HfV-IgV9bVrlhRw3Nfp0Vf-S7x97l3JoO5tViXMHQThSUQGYSx3xbiyIwQSBtg0d';
const CLIENT_SECRET = 'EBpgmMQRm6JUQV2OKJ34P7y5K2QhAuUBhZebgTF9Z5U_qfZY2MVqQM9MMuKF7NwCR3QErDkqhwGFMSYy';

async function getAccessToken() {
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  return data.access_token;
}

async function createProduct(accessToken, productData) {
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/catalogs/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(productData)
  });
  
  return await response.json();
}

async function createPlan(accessToken, planData) {
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/billing/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(planData)
  });
  
  return await response.json();
}

async function main() {
  try {
    console.log('🔑 Obteniendo token de acceso...');
    const accessToken = await getAccessToken();
    
    // Crear producto Pro
    console.log('📦 Creando producto Pro...');
    const proProduct = await createProduct(accessToken, {
      name: 'QuickLink Pro',
      description: 'Unlimited links and advanced analytics',
      type: 'SERVICE',
      category: 'SOFTWARE'
    });
    
    console.log('✅ Producto Pro creado:', proProduct.id);
    
    // Crear plan Pro
    console.log('💰 Creando plan Pro ($9/mes)...');
    const proPlan = await createPlan(accessToken, {
      product_id: proProduct.id,
      name: 'Pro Monthly Plan',
      description: 'Monthly subscription for QuickLink Pro',
      billing_cycles: [{
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: '9.00',
            currency_code: 'USD'
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0.00',
          currency_code: 'USD'
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    });
    
    console.log('✅ Plan Pro creado:', proPlan.id);
    
    // Crear producto Enterprise
    console.log('📦 Creando producto Enterprise...');
    const enterpriseProduct = await createProduct(accessToken, {
      name: 'QuickLink Enterprise',
      description: 'Everything in Pro plus team management and API access',
      type: 'SERVICE',
      category: 'SOFTWARE'
    });
    
    console.log('✅ Producto Enterprise creado:', enterpriseProduct.id);
    
    // Crear plan Enterprise
    console.log('💰 Creando plan Enterprise ($49/mes)...');
    const enterprisePlan = await createPlan(accessToken, {
      product_id: enterpriseProduct.id,
      name: 'Enterprise Monthly Plan',
      description: 'Monthly subscription for QuickLink Enterprise',
      billing_cycles: [{
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: '49.00',
            currency_code: 'USD'
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0.00',
          currency_code: 'USD'
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    });
    
    console.log('✅ Plan Enterprise creado:', enterprisePlan.id);
    
    console.log('\n🎉 ¡Planes creados exitosamente!');
    console.log('\n📋 Actualiza tu código con estos IDs:');
    console.log(`Pro Plan ID: ${proPlan.id}`);
    console.log(`Enterprise Plan ID: ${enterprisePlan.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();