# Science Articles Explorer

A modern React application for exploring and discovering science articles from ArXiv. The app presents articles with beautiful cards showing titles, descriptions, and categories, and allows users to click on articles to view detailed information.

## Features

- 🔍 **Search Functionality**: Search articles by title, description, or tags
- 🏷️ **Category Filtering**: Filter articles by scientific categories
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🔗 **Direct Links**: Click "Read Full Paper" to access the original ArXiv papers
- 🎨 **Modern UI**: Clean design with Tailwind CSS and Lucide icons

## Current Articles

The app currently includes 3 curated science articles:

1. **Advancing Multimodal Large Language Models with Vision-Language Consistency** (Machine Learning)
2. **Quantum Computing Applications in Cryptographic Security** (Quantum Computing)
3. **Neural Network Optimization for Edge Computing Environments** (Edge Computing)

## Getting Started

### Prerequisites

Make sure you have Node.js (version 16 or higher) installed on your system.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

To create a production build:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ArticleCard.jsx     # Individual article display cards
│   ├── ArticleModal.jsx    # Detailed article view modal
│   └── Header.jsx          # App header with search and filters
├── data/
│   └── articles.js         # Article data (ready for API integration)
├── App.jsx                 # Main application component
├── main.jsx               # React entry point
└── index.css              # Global styles with Tailwind
```

## Future Enhancements

- 📡 **Automated ArXiv Integration**: Daily fetching of new articles
- 🏷️ **Smart Categorization**: AI-powered article categorization
- 💾 **Favorites System**: Save and bookmark interesting articles
- 📊 **Analytics**: Track reading patterns and popular articles
- 🔔 **Notifications**: Get alerts for new articles in favorite categories

## Technologies Used

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Responsive Design** - Mobile-first approach

## License

MIT License - feel free to use this project as a starting point for your own science article explorer! 