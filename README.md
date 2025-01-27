# AGI Hunt

AGI Hunt is a comprehensive social media aggregation platform that showcases tweets from influential figures in AI, Web3, XR, and robotics domains. Built with Nuxt.js, it provides a modern and intuitive interface for discovering and exploring trending discussions in these cutting-edge fields.

## Features

- **Multi-domain Coverage**: AI, Web3, XR, and Robotics
- **Multi-language Support**: English, Chinese, and Japanese
- **Dynamic Content**: Daily updates of trending discussions
- **Rich Content Display**: Markdown rendering and code syntax highlighting
- **Interactive UI**: Modern and responsive design with DaisyUI components
- **Twitter Integration**: Native tweet embedding
- **Smart Filtering**: Domain-specific tags and sorting options

## Tech Stack

- **Framework**: [Nuxt.js](https://nuxt.com/)
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Markdown**: [markdown-it](https://github.com/markdown-it/markdown-it)
- **Date Handling**: [Day.js](https://day.js.org/)
- **Code Highlighting**: [highlight.js](https://highlightjs.org/)

## Setup

Make sure to install the dependencies:

```bash
# pnpm (recommended)
pnpm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm dev
```

## Production

Build the application for production:

```bash
# pnpm
pnpm build
```

Preview the production build:

```bash
# pnpm
pnpm preview
```

## Data Structure

The application expects JSON data files in the following format:
- Location: `/public/data/<domain>/<date>_<language>.json`
- Example: `/public/data/ai/2024-03-23_en.json`

Each JSON file should contain an array of events, where each event has:
- `eventId`: Unique identifier
- `title`: Event title
- `hotValue`: Popularity score
- `createDate`: Creation timestamp
- `tposts`: Array of related tweets

## Contributing

Feel free to contribute to this project by:
1. Forking the repository
2. Creating your feature branch
3. Committing your changes
4. Creating a pull request

## License

[MIT License](LICENSE)
