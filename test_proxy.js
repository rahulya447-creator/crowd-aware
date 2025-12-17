import fetch from 'node-fetch';

async function testProxy() {
    // Connaught Place to India Gate
    const coordinates = '77.2167,28.6315;77.2295,28.6129';
    const url = `http://localhost:3000/api/route?coordinates=${encodeURIComponent(coordinates)}`;

    console.log(`Testing Proxy URL: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        console.log('Response Body Preview:', text.substring(0, 500));

        if (!response.ok) {
            console.error('Test Failed!');
        } else {
            console.log('Test Passed!');
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

testProxy();
