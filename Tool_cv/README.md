# Thợ Tốt Doitay (CV Online)

Zalo Mini App for Tradespeople to showcase their profile and portfolio.

## Tech Stack
- **Framework**: Zalo Mini App (React + Vite)
- **UI**: ZMP-UI + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Copy `.env.example` to `.env` and add your Firebase configuration.
    ```bash
    cp .env.example .env
    ```

3.  **Run Development Server**
    ```bash
    npm start
    ```
    This will start the Zalo Mini App on `localhost`.

4.  **Deploy**
    ```bash
    npm run deploy
    ```

## Structure
- `src/pages`: Application screens.
- `src/services`: Firebase and API services.
- `src/components`: Reusable UI components.
- `app-config.json`: Main ZMP configuration.

## Admin Access
Để vào Admin Dashboard:
1. Mở app trên màn hình loading hoặc welcome
2. Tap nhanh 5 lần vào logo
3. Dashboard sẽ hiển thị với danh sách thợ để xác thực
