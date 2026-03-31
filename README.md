# Base64 Utility

A client-side web tool for encoding and decoding Base64 data. Supports strings, images, and any file type.

**100% Client-side - No data sent to server!**

## Features

- ✅ Encode text to Base64
- ✅ Encode files (images, documents, etc.) to Base64
- ✅ Decode Base64 to text
- ✅ Decode Base64 to image (with preview)
- ✅ Decode Base64 to file (with auto file type detection)
- ✅ Drag & drop file support
- ✅ Copy to clipboard
- ✅ Download results
- ✅ Auto-detect output type
- ✅ Dark mode UI
- ✅ Responsive design

## Supported File Types Detection

| Category | Formats |
|----------|---------|
| Images | PNG, JPEG, GIF, WebP, BMP, ICO, SVG |
| Documents | PDF |
| Archives | ZIP, GZIP, RAR, 7Z |
| Audio | MP3, WAV, OGG |
| Video | MP4, AVI |
| Others | Text, Binary |

## Usage

### Option 1: Open directly in browser

Simply open `index.html` in your web browser.

### Option 2: Use a local server

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## How to Use

### Encoding

1. Select **Encode** tab
2. Choose input type: **Text** or **File/Image**
3. Enter text or drag & drop a file
4. Click **Encode to Base64**
5. Copy or download the result

### Decoding

1. Select **Decode** tab
2. Paste Base64 string or upload a .txt file containing Base64
3. Choose output type: **Auto Detect**, **Text**, **Image**, or **File**
4. Click **Decode from Base64**
5. View the result and download if needed

## Project Structure

```
base64util/
├── index.html      # Main HTML file
├── css/
│   └── style.css   # Styles
├── js/
│   └── app.js      # Main JavaScript logic
└── README.md       # Documentation
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## Demo

[https://herusdianto.github.io/base64util/](https://herusdianto.github.io/base64util/)