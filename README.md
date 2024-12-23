## Requirements

- **PHP** for the Laravel backend
- **Composer** for managing PHP dependencies
- **Node.js** for the React frontend
- **npm** (Node Package Manager) to install frontend dependencies
- **Google API Key** for the YouTube Data API
- **MySQL** 

## Backend Setup (Laravel)

### 1. Clone the Backend Repository:
```bash
git clone https://github.com/mosesket/youtubeAPI.git
cd youtubeAPI
```

### 2. Install Dependencies:
Run the following command to install the necessary PHP dependencies:
```bash
composer update
```

### 3. Configure Environment Variables:
Create a `.env` file from the example file and set the required credentials, such as the database and YouTube API key:
```bash
cp .env.example .env
php artisan key:generate
```
Edit `.env` and add your **YouTube API key**:
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 4. Run Migrations:
Set up the database schema:
```bash
php artisan migrate
```

### 6. Start the Laravel Development Server:
```bash
php artisan serve
```
This will start the server on `http://127.0.0.1:8000`. or any address make sure the ensure the url matches on the react application

## Frontend Setup (React)

### 1. CD into the Frontend folder:
```bash
cd youtube-ui
```

### 2. Install Dependencies:
Install the necessary npm packages:
```bash
npm install
```

### 3. Configure API URL:
In the `src/App.jsx` file, make sure the backend API URL is correctly set:
```js
const response = await axios.get("http://127.0.0.1:8000/api/video-details", {
    params: { videoId },
});
```

### 4. Start the React Development Server:
```bash
npm run dev
```
This will start the React app on localhost.
