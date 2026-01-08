import 'dotenv/config';

const url = process.env.DATABASE_URL;

console.log('--- ENV DIAGNOSTIC ---');
if (!url) {
    console.log('ERROR: DATABASE_URL is effectively undefined or empty.');
} else {
    console.log(`Length: ${url.length}`);
    console.log(`Starts with mysql:// ?: ${url.startsWith('mysql://')}`);
    console.log(`Contains spaces?: ${url.includes(' ')}`);
    console.log(`Contains double quotes inside?: ${url.includes('"')}`);
    console.log(`Contains single quotes inside?: ${url.includes("'")}`);
    console.log(`First 10 chars: ${url.substring(0, 10)}...`);
    // Check for invisible characters
    console.log(`First char code: ${url.charCodeAt(0)}`);
    console.log(`Last char code: ${url.charCodeAt(url.length - 1)}`);
}
console.log('--- END DIAGNOSTIC ---');
