// Improved Basic Authentication logging
console.log('Raw Credentials:', `${USERNAME}:${PASSWORD}`);
console.log('Base64 Encoded Credentials:', Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64'));

// Optional: Trim any whitespace from credentials
const trimmedUsername = USERNAME.trim();
const trimmedPassword = PASSWORD.trim();
const credentials = Buffer.from(`${trimmedUsername}:${trimmedPassword}`).toString('base64');
