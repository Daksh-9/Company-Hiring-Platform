// Test script for Judge0 integration
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testJudge0Integration() {
    console.log('🧪 Testing Judge0 Integration...\n');

    try {
        // Test 1: Python Hello World
        console.log('📝 Test 1: Python Hello World');
        const pythonTest = await axios.post(`${BASE_URL}/api/run`, {
            source_code: 'print("Hello, World!")',
            language_id: 71, // Python
            stdin: ''
        }, {
            headers: {
                'Authorization': 'Bearer test-token', // You'll need a real token
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Python test result:', pythonTest.data.stdout);

        // Test 2: JavaScript
        console.log('\n📝 Test 2: JavaScript');
        const jsTest = await axios.post(`${BASE_URL}/api/run`, {
            source_code: 'console.log("Hello from Node.js!");',
            language_id: 63, // JavaScript
            stdin: ''
        }, {
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ JavaScript test result:', jsTest.data.stdout);

        console.log('\n🎉 Judge0 integration test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('💡 Note: You need to be authenticated to test the /api/run endpoint');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testJudge0Integration();
}

module.exports = { testJudge0Integration };

