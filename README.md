# Analyzr

A lightweight, privacy-focused user analytics platform. Analyzr consists of three main components: a tracking SDK for client websites, an Express/MongoDB backend to process events, and a Next.js dashboard to visualize the data.

## Tech Stack

*   **Dashboard (Frontend):** Next.js (App Router), React, Tailwind CSS, Framer Motion, Lucide React.
*   **Backend (API):** Node.js, Express, MongoDB with Mongoose, JSON Web Tokens (JWT) for authentication.
*   **Tracker SDK:** Vanilla JavaScript (zero dependencies), bundled with esbuild (supports UMD, ESM, and CJS).

## Setup Instructions

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB instance (local or Atlas)

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a \`.env\` file in the \`backend\` directory with the following variables:
    ```env
    PORT=3001
    MONGO_URI=mongodb://localhost:27017/user-analytics
    JWT_SECRET=your_super_secret_jwt_key
    FRONTEND_URL=http://localhost:3000
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Dashboard Setup

1.  Navigate to the dashboard directory:
    ```bash
    cd dashboard
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a \`.env.local\` file in the \`dashboard\` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

### 3. Tracker SDK Setup

1.  Navigate to the tracker SDK directory:
    ```bash
    cd tracker-sdk
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the SDK bundles (UMD, ESM, CJS):
    ```bash
    npm run build
    ```

## Assumptions and Trade-offs

*   **Database Choice:** MongoDB is used for rapid development and flexibility. However, for a high-volume production analytics system, a specialized time-series database (such as ClickHouse or TimescaleDB) would be more appropriate to handle millions of events efficiently.
*   **Authentication:** The system uses a simple JWT-based authentication where tokens are stored in \`localStorage\`. While convenient, a more robust production setup might employ \`HttpOnly\` cookies and refresh token rotation to mitigate XSS vulnerabilities.
*   **SDK Design:** The tracker SDK is written in plain JavaScript without framework dependencies to keep the bundle size minimal (under 2KB). This ensures it has a negligible impact on the host website's performance and Core Web Vitals.
*   **Event Dispatching:** The SDK uses a batching mechanism (sending data every 2 seconds or when 10 events accumulate) and relies on \`navigator.sendBeacon\` with a \`fetch\` fallback. This ensures events are sent reliably even if the user navigates away or closes the tab.
*   **Heatmap Visualization:** To handle different screen sizes, the heatmap implementation records click coordinates relative to the viewport and uses a fixed virtual viewport mapping (e.g., 1440x1000) with CSS transforms in the dashboard. This provides a consistent visual representation regardless of the viewer's screen dimensions.
*   **Deployment Architecture:** The project structure is separated into distinct services to allow independent scaling. The current setup is optimized for deployment on serverless platforms and free-tier PaaS providers (e.g., Vercel for the dashboard, Render for the backend), which introduces potential cold-start latency that must be accounted for.
