
const testLogin = async () => {
    const url = 'http://localhost:5000/api/auth/login';
    const payload = {
        email: 'kathir07',
        password: 'password123'
    };

    console.log(`Connecting to ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log('Response Body:', data);
        } catch (e) {
            console.log('Response Body (Text):', text);
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
};

testLogin();
