require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const sampleProducts = [
    {
        barcode: '8901030895029',
        name: 'Maggi Noodles 2-Minute',
        price: 12,
        quantity: 100,
        category: 'Food',
        description: 'Instant noodles - Masala flavor',
    },
    {
        barcode: '8901725125028',
        name: 'Parle-G Biscuits',
        price: 5,
        quantity: 200,
        category: 'Food',
        description: 'Glucose biscuits',
    },
    {
        barcode: '8901063114319',
        name: 'Britannia Good Day',
        price: 30,
        quantity: 150,
        category: 'Food',
        description: 'Butter cookies',
    },
    {
        barcode: '8901396316909',
        name: 'Amul Milk 1L',
        price: 60,
        quantity: 50,
        category: 'Dairy',
        description: 'Full cream milk',
    },
    {
        barcode: '8906010340018',
        name: 'Lays Chips',
        price: 20,
        quantity: 120,
        category: 'Snacks',
        description: 'Classic salted chips',
    },
    {
        barcode: '8901719113017',
        name: 'Coca Cola 600ml',
        price: 40,
        quantity: 80,
        category: 'Beverages',
        description: 'Carbonated soft drink',
    },
    {
        barcode: '8906010340025',
        name: 'Kurkure Masala Munch',
        price: 10,
        quantity: 150,
        category: 'Snacks',
        description: 'Crunchy snack',
    },
    {
        barcode: '8901063113817',
        name: 'Britannia Bread',
        price: 35,
        quantity: 60,
        category: 'Bakery',
        description: 'Whole wheat bread',
    },
    {
        barcode: '8906010340032',
        name: 'Pepsi 600ml',
        price: 40,
        quantity: 75,
        category: 'Beverages',
        description: 'Carbonated soft drink',
    },
    {
        barcode: '8901030895036',
        name: 'Maggi Ketchup',
        price: 85,
        quantity: 90,
        category: 'Condiments',
        description: 'Tomato ketchup',
    },
    // Test barcodes for easy scanning
    {
        barcode: '123456789012',
        name: 'Test Product 1',
        price: 100,
        quantity: 50,
        category: 'Test',
        description: 'Sample test product',
    },
    {
        barcode: '987654321098',
        name: 'Test Product 2',
        price: 250,
        quantity: 30,
        category: 'Test',
        description: 'Another test product',
    },
];

const seedProducts = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        console.log('🗑️  Clearing existing products...');
        await Product.deleteMany({});
        console.log('✅ Cleared existing products');

        console.log('📦 Seeding products...');
        await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded ${sampleProducts.length} products`);

        console.log('\n📋 Sample Products:');
        sampleProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - ₹${product.price} (Barcode: ${product.barcode})`);
        });

        console.log('\n✨ Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedProducts();
