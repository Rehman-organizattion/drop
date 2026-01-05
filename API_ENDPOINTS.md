# GitHub Integration API - Endpoints Guide

## Base URL
```
http://localhost:3000
```

---

## Step-by-Step Endpoint Guide

### Step 1: GitHub OAuth Login

**Endpoint:** `GET /auth/github/login`

**Method:** `GET`

**Description:** Initiates GitHub OAuth flow. Redirects user to GitHub authorization page.

**Frontend Implementation:**
```javascript
// Option 1: Direct redirect (recommended)
window.location.href = 'http://localhost:3000/auth/github/login'

// Option 2: Using fetch (will follow redirect)
fetch('http://localhost:3000/auth/github/login', {
  method: 'GET',
  redirect: 'follow'
})
```

**Response:**
- **Status:** `302 Redirect`
- **Action:** Browser automatically redirects to GitHub OAuth page
- **User Action:** User must authorize the application on GitHub

**What Happens:**
1. User is redirected to GitHub
2. User authorizes the app
3. GitHub redirects to callback URL with authorization code

---

### Step 2: OAuth Callback (Automatic)

**Endpoint:** `GET /auth/github/callback?code=xxx`

**Method:** `GET`

**Description:** Handled automatically by GitHub redirect. Exchanges code for token and syncs data.

**Note:** This endpoint is called automatically by GitHub. You don't need to call it from frontend.

**Response:**
- **Status:** `302 Redirect`
- **Action:** Automatically redirects to `/integration/status`

---

### Step 3: Check Integration Status

**Endpoint:** `GET /integration/status`

**Method:** `GET`

**Description:** Get current integration status and data statistics.

**Frontend Implementation:**
```javascript
// Using fetch
const response = await fetch('http://localhost:3000/integration/status', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
console.log(result)
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "status": "connected",
    "integration": {
      "githubUsername": "your-username",
      "integrationStatus": "active",
      "connectionTimestamp": "2024-01-15T10:30:00.000Z",
      "lastSyncTimestamp": "2024-01-15T11:45:00.000Z"
    },
    "stats": {
      "integration": 1,
      "organizations": 2,
      "repos": 15,
      "commits": 2500,
      "pulls": 45,
      "issues": 120,
      "changelogs": 350,
      "users": 25
    }
  }
}
```

**Error Response (No Integration):**
```json
{
  "success": false,
  "error": "No active GitHub integration found"
}
```

---

### Step 4: Get Collection Data

**Endpoint:** `GET /data/:collection`

**Method:** `GET`

**Available Collections:**
- `organizations`
- `repos`
- `commits`
- `pulls`
- `issues`
- `changelogs`
- `users`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `sort_by` | string | createdAt | Field to sort by |
| `sort_order` | string | desc | `asc` or `desc` |
| `filter` | string (JSON) | - | MongoDB filter object |
| `search` | string | - | Search keyword |

**Frontend Implementation:**
```javascript
// Basic request
const response = await fetch('http://localhost:3000/data/issues?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})

const result = await response.json()

// With pagination
const page = 1
const limit = 20
const response = await fetch(
  `http://localhost:3000/data/issues?page=${page}&limit=${limit}&sort_by=created_at&sort_order=desc`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
)

// With filter
const filter = JSON.stringify({ state: 'open' })
const response = await fetch(
  `http://localhost:3000/data/issues?filter=${encodeURIComponent(filter)}`,
  {
    method: 'GET'
  }
)

// With search
const response = await fetch(
  'http://localhost:3000/data/issues?search=bug',
  {
    method: 'GET'
  }
)

// Complete example with all parameters
const params = new URLSearchParams({
  page: '1',
  limit: '20',
  sort_by: 'created_at',
  sort_order: 'desc',
  filter: JSON.stringify({ state: 'open' }),
  search: 'bug'
})

const response = await fetch(`http://localhost:3000/data/issues?${params}`, {
  method: 'GET'
})
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 123,
      "title": "Bug fix",
      "state": "open",
      "created_at": "2024-01-15T10:00:00Z",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Collection not found"
}
```

**Example Requests:**
```
GET /data/organizations?page=1&limit=10
GET /data/repos?page=1&limit=20&sort_by=updated_at&sort_order=desc
GET /data/commits?page=1&limit=50&sort_by=commit.author.date
GET /data/pulls?filter={"state":"open"}&page=1&limit=10
GET /data/issues?search=bug&page=1&limit=20
GET /data/users?page=1&limit=15
```

---

### Step 5: Global Search

**Endpoint:** `GET /search?q=keyword`

**Method:** `GET`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search keyword |

**Frontend Implementation:**
```javascript
// Basic search
const keyword = 'authentication'
const response = await fetch(
  `http://localhost:3000/search?q=${encodeURIComponent(keyword)}`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
)

const result = await response.json()
console.log(result)
```

**Response:**
```json
{
  "success": true,
  "message": "Search done",
  "data": {
    "repos": [
      {
        "id": 123,
        "name": "auth-service",
        "full_name": "org/auth-service",
        "description": "Authentication service",
        ...
      }
    ],
    "issues": [
      {
        "id": 456,
        "title": "Authentication bug",
        "state": "open",
        ...
      }
    ],
    "commits": [
      {
        "sha": "abc123",
        "commit": {
          "message": "Fix authentication"
        },
        ...
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Search query missing"
}
```

**Note:** Search returns up to 10 results per collection. Results are grouped by collection type.

---

### Step 6: Resync Data

**Endpoint:** `POST /integration/resync`

**Method:** `POST`

**Description:** Re-fetches all GitHub data and updates the database.

**Frontend Implementation:**
```javascript
const response = await fetch('http://localhost:3000/integration/resync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
console.log(result)
```

**Response:**
```json
{
  "success": true,
  "message": "Data resynced successfully",
  "data": {
    "organizations": 2,
    "repos": 15,
    "commits": 2500,
    "pulls": 45,
    "issues": 120,
    "changelogs": 350,
    "users": 25
  }
}
```

**Note:** This operation can take several minutes depending on data size.

---

### Step 7: Remove Integration Data

**Endpoint:** `POST /integration/remove`

**Method:** `POST`

**Description:** Deletes all GitHub data from database (keeps integration record).

**Frontend Implementation:**
```javascript
const response = await fetch('http://localhost:3000/integration/remove', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
console.log(result)
```

**Response:**
```json
{
  "success": true,
  "message": "Integration data removed successfully",
  "data": null
}
```

**Warning:** This permanently deletes all stored GitHub data!

---

## Complete Frontend Example (React)

```javascript
// API Service
const API_BASE_URL = 'http://localhost:3000'

class GitHubIntegrationAPI {
  // Step 1: Login
  static login() {
    window.location.href = `${API_BASE_URL}/auth/github/login`
  }

  // Step 3: Get Status
  static async getStatus() {
    const response = await fetch(`${API_BASE_URL}/integration/status`)
    if (!response.ok) throw new Error('Failed to get status')
    return await response.json()
  }

  // Step 4: Get Collection
  static async getCollection(collection, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort_by = 'createdAt',
      sort_order = 'desc',
      filter = null,
      search = null
    } = options

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order
    })

    if (filter) params.append('filter', JSON.stringify(filter))
    if (search) params.append('search', search)

    const response = await fetch(`${API_BASE_URL}/data/${collection}?${params}`)
    if (!response.ok) throw new Error('Failed to get collection')
    return await response.json()
  }

  // Step 5: Search
  static async search(keyword) {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(keyword)}`)
    if (!response.ok) throw new Error('Failed to search')
    return await response.json()
  }

  // Step 6: Resync
  static async resync() {
    const response = await fetch(`${API_BASE_URL}/integration/resync`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to resync')
    return await response.json()
  }

  // Step 7: Remove
  static async remove() {
    const response = await fetch(`${API_BASE_URL}/integration/remove`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to remove')
    return await response.json()
  }
}

// Usage Example
async function example() {
  try {
    // Check status
    const status = await GitHubIntegrationAPI.getStatus()
    console.log('Status:', status)

    // Get issues with pagination
    const issues = await GitHubIntegrationAPI.getCollection('issues', {
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc',
      filter: { state: 'open' }
    })
    console.log('Issues:', issues)

    // Search
    const searchResults = await GitHubIntegrationAPI.search('bug')
    console.log('Search results:', searchResults)

    // Resync data
    const resyncResult = await GitHubIntegrationAPI.resync()
    console.log('Resync result:', resyncResult)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Complete Frontend Example (Vanilla JavaScript)

```javascript
// API Configuration
const API_URL = 'http://localhost:3000'

// Helper function
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

// Step 1: Login
function login() {
  window.location.href = `${API_URL}/auth/github/login`
}

// Step 3: Get Status
async function getStatus() {
  return await apiCall('/integration/status')
}

// Step 4: Get Collection
async function getCollection(collection, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  return await apiCall(`/data/${collection}?${queryString}`)
}

// Step 5: Search
async function search(keyword) {
  return await apiCall(`/search?q=${encodeURIComponent(keyword)}`)
}

// Step 6: Resync
async function resync() {
  return await apiCall('/integration/resync', 'POST')
}

// Step 7: Remove
async function remove() {
  return await apiCall('/integration/remove', 'POST')
}

// Usage
document.getElementById('loginBtn').addEventListener('click', login)

document.getElementById('statusBtn').addEventListener('click', async () => {
  try {
    const result = await getStatus()
    console.log(result)
  } catch (error) {
    console.error(error)
  }
})

document.getElementById('searchBtn').addEventListener('click', async () => {
  try {
    const keyword = document.getElementById('searchInput').value
    const result = await search(keyword)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
})
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (route or collection not found)
- `500` - Internal Server Error

**Example Error Handling:**
```javascript
try {
  const response = await fetch('http://localhost:3000/data/invalid')
  const data = await response.json()

  if (!data.success) {
    console.error('API Error:', data.error)
    // Handle error
  } else {
    // Handle success
    console.log('Data:', data.data)
  }
} catch (error) {
  console.error('Network Error:', error)
}
```

---

## Complete Workflow Example

```javascript
// 1. User clicks "Connect GitHub" button
function connectGitHub() {
  window.location.href = 'http://localhost:3000/auth/github/login'
}

// 2. After redirect back, check status
async function checkStatus() {
  const response = await fetch('http://localhost:3000/integration/status')
  const result = await response.json()
  
  if (result.success) {
    console.log('Connected as:', result.data.integration.githubUsername)
    console.log('Stats:', result.data.stats)
  }
}

// 3. Display issues
async function loadIssues(page = 1) {
  const response = await fetch(
    `http://localhost:3000/data/issues?page=${page}&limit=10&sort_by=created_at&sort_order=desc`
  )
  const result = await response.json()
  
  if (result.success) {
    displayIssues(result.data)
    displayPagination(result.pagination)
  }
}

// 4. Search functionality
async function handleSearch(keyword) {
  const response = await fetch(
    `http://localhost:3000/search?q=${encodeURIComponent(keyword)}`
  )
  const result = await response.json()
  
  if (result.success) {
    displaySearchResults(result.data)
  }
}

// 5. Resync button
async function handleResync() {
  const button = document.getElementById('resyncBtn')
  button.disabled = true
  button.textContent = 'Syncing...'
  
  try {
    const response = await fetch('http://localhost:3000/integration/resync', {
      method: 'POST'
    })
    const result = await response.json()
    
    if (result.success) {
      alert(`Synced: ${JSON.stringify(result.data)}`)
      // Reload data
      await loadIssues(1)
    }
  } catch (error) {
    console.error('Resync failed:', error)
  } finally {
    button.disabled = false
    button.textContent = 'Resync'
  }
}
```

---

## Quick Reference

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/auth/github/login` | GET | Start OAuth | Redirects to GitHub |
| `/auth/github/callback` | GET | OAuth callback | Auto-redirects |
| `/integration/status` | GET | Get status | Status + stats |
| `/data/:collection` | GET | Get collection data | Paginated data |
| `/search?q=keyword` | GET | Global search | Search results |
| `/integration/resync` | POST | Resync data | Sync results |
| `/integration/remove` | POST | Remove data | Success message |

---

This guide provides everything you need to integrate the GitHub Integration API into your frontend application!







