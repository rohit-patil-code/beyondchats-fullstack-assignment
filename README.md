# BeyondChats Fullstack Assignment

A full-stack web application that scrapes blog articles from BeyondChats, enhances them using AI with external references, and displays both original and AI-updated versions through a React frontend.

# LIVE LINK:
https://articles.rohitcodes.tech

## Project Overview

This project is a three-phase implementation that demonstrates web scraping, AI-powered content enhancement, and modern frontend development. The system scrapes articles from BeyondChats, enriches them using Groq LLM (LLaMA 3.x) with external Google search results, and presents both original and enhanced versions in a clean, organized interface.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Web Scraping**: Axios, Cheerio
- **AI Integration**: Groq LLM (LLaMA 3.x) via OpenAI-compatible API
- **Search**: Google via SerpAPI
- **Frontend**: React (Vite)
- **Language**: JavaScript

## Features

### Phase 1 - Web Scraping
- Scrapes blog articles from BeyondChats website
- Extracts article metadata (title, content, author, publication date, images)
- Stores articles in PostgreSQL database
- Handles pagination to collect multiple articles

### Phase 2 - AI Enhancement
- Fetches original articles from the database
- Performs Google searches with BeyondChats exclusion (`-site:beyondchats.com`)
- Filters out ads and sponsored results
- Removes "BeyondChats" references from search queries
- Scrapes external reference articles
- Enhances content using Groq LLM with external references
- Creates new article records with updated content (preserves originals)
- Updated articles have modified slugs (`-updated`), URLs (`?updated=true`), and `is_updated = true` flag

### Phase 3 - Frontend Display
- React-based user interface built with Vite
- Fetches all articles from backend API
- Separates original and AI-updated articles using `is_updated` flag
- Displays articles in organized sections with badges
- Full article detail view
- Responsive design with Tailwind CSS

## Architecture

The application follows a three-tier architecture:

1. **Data Layer**: PostgreSQL database stores both original and updated articles
2. **Backend Layer**: Express.js API handles article operations and Phase 2 processing
3. **Frontend Layer**: React application consumes the API and displays articles

### Data Flow

1. **Phase 1**: Scraper → Database (original articles)
2. **Phase 2**: Database → Google Search → External Scraping → LLM Enhancement → Database (updated articles)
3. **Phase 3**: Frontend → API → Database → Frontend Display

### Key Design Decisions

- **Option B Implementation**: Updated articles are stored as new records rather than modifying originals
- **Single API Endpoint**: Frontend filters articles client-side using `is_updated` flag
- **Reference Filtering**: Phase 2 explicitly excludes BeyondChats and ads from search results
- **Data Integrity**: Database was reset after implementing proper reference filtering

## Folder Structure

```
beyondchats-fullstack-assignment/
├── backend/
│   ├── src/
│   │   ├── scraper/
│   │   │   └── scrapeArticles.js
│   │   ├── phase2/
│   │   │   ├── fetchArticles.js
│   │   │   ├── googleSearch.js
│   │   │   ├── scrapeExternal.js
│   │   │   ├── llmRewrite.js
│   │   │   ├── publishArticle.js
│   │   │   ├── index.js
│   │   │   └── prompts/
│   │   │       └── rewritePrompt.js
│   │   ├── routes/
│   │   │   └── router.js
│   │   ├── controller/
│   │   │   └── articleController.js
│   │   ├── models/
│   │   │   └── articleModel.js
│   │   └── config/
│   │       └── db.js
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ArticleCard.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── VersionToggle.jsx
│   │   │   ├── pages/
│   │   │   │   ├── ArticleList.jsx
│   │   │   │   └── ArticleDetail.jsx
│   │   │   ├── api/
│   │   │   │   └── articles.js
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── server.js
│   ├── app.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
GROQ_API_KEY=your_groq_api_key
SERP_API_KEY=your_serpapi_key
NODE_ENV=development
PORT=3000
```

4. Create the PostgreSQL database and run the schema (create articles table with columns: id, title, slug, content, excerpt, author, published_at, image_url, url, source, is_updated).

5. Start the backend server:
```bash
node server.js
```

The backend API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd backend/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the API base URL in `src/api/articles.js` if needed (default: `http://localhost:3000/api`)

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

### Running Phases

**Phase 1 - Scraping:**
```bash
cd backend
node src/scraper/scrapeArticles.js
```

**Phase 2 - AI Enhancement:**
```bash
cd backend
node src/phase2/index.js
```

**Phase 3 - Frontend:**
Already running via `npm run dev` in the `backend/frontend` directory

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name

# API Keys
GROQ_API_KEY=your_groq_api_key_here
SERP_API_KEY=your_serpapi_key_here

# Server Configuration
NODE_ENV=development
PORT=3000
```

## Phase 2: Avoiding Self-Referencing and Ads

Phase 2 implements multiple layers of filtering to ensure AI enhancement uses only external, non-sponsored sources:

### Query Cleaning
- Removes "BeyondChats" from article titles before searching
- Applies case-insensitive removal of brand references

### Search Query Exclusion
- Uses `-site:beyondchats.com` in Google search queries to exclude BeyondChats domain
- Ensures search results come from external sources only

### Result Filtering
- Filters out results where `is_ad` flag is true
- Additional safety check: excludes any results containing "beyondchats.com" in the URL
- Limits to top 2 organic results for quality and relevance

### Implementation Details

The filtering logic in `backend/src/phase2/googleSearch.js`:
1. Cleans the article title by removing "BeyondChats" references
2. Constructs search query with `-site:beyondchats.com` exclusion
3. Filters organic results to remove ads (`is_ad === false`)
4. Double-checks URLs to exclude any BeyondChats links
5. Returns top 2 filtered results for external scraping

## Original vs Updated Articles

The system maintains both original and updated articles as separate database records:

### Original Articles
- Scraped directly from BeyondChats in Phase 1
- `is_updated = false` (or NULL)
- Original slug and URL
- Preserved in database without modification

### Updated Articles
- Created in Phase 2 after AI enhancement
- `is_updated = true`
- Modified slug: original slug + `-updated`
- Modified URL: original URL + `?updated=true`
- Enhanced content with external references
- Title includes "(Updated)" suffix

### Frontend Handling

The frontend fetches all articles from `/api/articles` and separates them client-side:
- Filters `is_updated === false` (or null) for Original articles
- Filters `is_updated === true` for AI-Updated articles
- Displays each group in separate sections with appropriate badges
- No separate API endpoint needed - single source of truth

### Database Schema

Articles table includes:
- All standard article fields (title, content, slug, url, etc.)
- `is_updated` boolean field to distinguish versions
- Both versions share the same base metadata (author, published_at, etc.)

## API Endpoints

### Backend APIs

- `GET /api/articles` - Fetch all articles
- `GET /api/articles/:id` - Fetch article by ID
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update existing article
- `DELETE /api/articles/:id` - Delete article

All endpoints return JSON responses. The frontend uses `GET /api/articles` to fetch all articles and filters them client-side based on `is_updated` flag.

## Screenshots

- Homepage showing Original and AI-Updated article sections
<img width="1916" height="1030" alt="image" src="https://github.com/user-attachments/assets/af8095cc-f3a0-427a-9cc3-fe027d34d35e" />

- Article detail view with full content
- <img width="1918" height="1027" alt="image" src="https://github.com/user-attachments/assets/93f239d8-cb20-42a0-ab8c-e6ac8bc28faf" />


## Future Improvements

- Implement pagination for large article collections
- Add search and filter functionality in frontend
- Implement caching for improved performance
- Add article comparison view (side-by-side original vs updated)
- Implement rate limiting for API endpoints
- Add error handling and retry logic for external scraping
- Implement user authentication and article management
- Add analytics and tracking for article views
- Implement automated Phase 2 scheduling
- Add unit and integration tests

