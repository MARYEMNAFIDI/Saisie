# Saisie - Data Entry Application

A React application for data entry with simulated authentication.

## Features

- Simulated user authentication (frontend only)
- Data entry form
- List of entered data

## Project Structure

- `src/services/authService.js` - Simulated authentication service (replace with real API)
- `src/contexts/AuthContext.jsx` - Authentication context provider
- `src/App.jsx` - Main application component

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Authentication

The authentication is currently simulated on the frontend. To replace with real authentication:

1. Update `src/services/authService.js` to make actual API calls to your backend.
2. Modify the login/logout functions to handle JWT tokens, etc.
3. Add proper error handling and validation.

## Building for Production

```bash
npm run build
```

## Technologies Used

- React
- Vite
- JavaScript