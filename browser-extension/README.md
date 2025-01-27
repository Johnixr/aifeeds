# AI Feeds Card Capture Extension

This Chrome extension allows you to capture AI Feeds cards including Twitter embeds.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this directory

## Usage

1. Navigate to a page with an AI Feeds card
2. Click the extension icon in the toolbar
3. Click "Capture Card" to capture and download the card

## Features

- Captures the entire card content, including Twitter embeds
- Automatically scrolls to capture all content
- Downloads the result as a PNG file

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `popup.html/js`: Extension popup UI and logic
- `content.js`: Content script for capturing cards
- `images/`: Extension icons
