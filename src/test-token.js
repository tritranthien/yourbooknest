const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlcGNoYWl2YWkiLCJzdWIiOiI2MjM1Yjc4ZmUyZWQxNWZjM2Q1YWUzZjAiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjY1NjczMDIsImV4cCI6MTc3MTc1MTMwMn0.lV_5HTVtC7UuGxUl1xhWsZ2cjSawd0VFCSmzPThFF1Y";
const secret = "09f26e402586e2faa8da4c98a35f1b20";

try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded successfully:', decoded);
} catch (err) {
    console.error('Verification failed:', err.message);
    
    // Try with fallback
    try {
        const decodedFallback = jwt.verify(token, 'fallbackSecret');
        console.log('Decoded with fallbackSecret successfully:', decodedFallback);
    } catch (err2) {
        console.error('Verification with fallbackSecret also failed:', err2.message);
    }
}
