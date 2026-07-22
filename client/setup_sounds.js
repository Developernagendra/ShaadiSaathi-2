const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1-second silent mp3 base64 string
const silent_mp3 = 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU5LjE2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAARgAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ/////////////////////////////////////wAAADhMYXZjNTkuMTguMTAwAAAAAAAAAAAAAAACRAAAPeA38YJRAAAARgAAAAAA//MUxAAAAANIAMIAAAAq4ABCAAAATzE0MwwAAAAAIgAAAAAAbgBwAAcKBAAHCw4ICwwIBQYCBQYCBQUHBQUFAwMDAwIICAkKCQsLCgsLCgoJCQkKCgkDAwMDAwMDAwMHBwYGBgYFBAQFBQUFBwYHBgcHBwcJCAgICQkKCgoLDAwNDQ4PDw8PDw8ODg4NDAwLCgkIBwUEAgIAAQEBCAgAAAAAAAAP/zDEsAAu0CxgDCAAAKpAALAAAAAnB5ZDAAAAEAAAAAAQAAAAAABwYGBAQGBwYEAwICAQECAwMDBQUHBwcJCQsLDA0NDg8QEBEA/8wxO0AL2AoQAwgAACgwAAAAAAAJ/zDE4oAuYCwwDCAAAKzAAAAAAAJ/zDE1AAuYCxADCAAAK/AAAAAAAJ//OExLQABQAAABgAAAQAAAAABAAACf/zDErQAuYCyADCAAAK9AAAAAAAJ/zDEuQAuYCzADCAAAK/AAAAAAAJ/zDEvAAuYC0ADCAAAK9AAAAAAAJ/zDEuwAuYC1ADCAAAKzAAAAAAAJ';

const files = ['success.mp3', 'error.mp3', 'approval.mp3', 'lead.mp3', 'notification.mp3'];

files.forEach(file => {
  fs.writeFileSync(path.join(targetDir, file), Buffer.from(silent_mp3, 'base64'));
  console.log(`Generated dummy audio: ${file}`);
});

console.log('Dummy mp3 sounds generated successfully in public/sounds/. Please replace them with actual audio files for real sound playback.');
