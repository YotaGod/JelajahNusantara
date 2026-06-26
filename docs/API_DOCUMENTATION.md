# API Documentation - Jelajah Nusantara

This document lists the internal Next.js API endpoints and database operations used to communicate between the client-side and backend services.

---

## 1. Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: `https://jelajah-nusantara-six.vercel.app`

---

## 2. Next.js Internal Endpoints

### A. Image Upload Proxy
Proxies uploads to ImgBB and returns the hosted image URL securely.

- **Endpoint**: `/api/upload`
- **Method**: `POST`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body (FormData)**:
  - `image`: File (Binary image payload)
- **Response Examples**:
  - **Success (200 OK)**:
    ```json
    {
      "url": "https://i.ibb.co/abcdef/image.png"
    }
    ```
  - **Error (400 Bad Request / 500 Internal Error)**:
    ```json
    {
      "error": "Failed to upload image"
    }
    ```

### B. Weather Forecast
Retrieves current weather conditions and a 5-day weather forecast based on geographic coordinates.

- **Endpoint**: `/api/weather`
- **Method**: `GET`
- **Query Parameters**:
  - `lat` (required): Latitude (e.g., `-6.1754`)
  - `lng` (required): Longitude (e.g., `106.8272`)
- **Response Examples**:
  - **Success (200 OK)**:
    ```json
    {
      "current": {
        "temp": 28.5,
        "description": "hujan ringan",
        "icon": "10d"
      },
      "forecast": [
        {
          "date": "2026-06-27",
          "temp": 27.9,
          "description": "berawan",
          "icon": "03d"
        }
        // ... up to 5 days
      ]
    }
    ```
  - **Error (400 Bad Request)**:
    ```json
    {
      "error": "Latitude and longitude are required"
    }
    ```

---

## 3. Database RPC Functions (Supabase)

### A. Delete Own Account
Allows users to delete their own credentials and cascade delete all personal records from profile, reviews, and favorites tables.

- **Function Name**: `delete_own_account`
- **Invoked via Supabase JS SDK**:
  ```typescript
  const { data, error } = await supabase.rpc('delete_own_account')
  ```
- **Access Level**: Authenticated User (Owner of the account)
- **Input Parameters**: None
- **Return Type**: `void`
