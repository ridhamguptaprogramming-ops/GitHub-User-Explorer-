# 🚀 DevScope – GitHub Developer Analytics Platform

DevScope is a modern GitHub Developer Analytics platform built with **HTML, CSS, and JavaScript**. It provides a cleaner and more insightful view of a developer's public GitHub profile by fetching live data from the GitHub REST API.

Unlike the default GitHub profile page, DevScope presents developer information in a modern dashboard with responsive cards, repository insights, recent searches, dark/light theme support, and a polished user experience.

---

## ✨ Features

### 👤 Developer Profile
- View GitHub avatar
- Display username and full name
- Bio
- Company
- Location
- Personal website
- Join date
- Followers
- Following
- Public repository count

### 📂 Repository Analytics
- Displays repositories sorted by ⭐ stars
- Repository description
- Programming language
- Fork count
- Last updated date
- Direct link to GitHub repository
- "Show More" pagination

### 🔍 Smart Search
- Search any public GitHub username
- Search using button or Enter key
- Loading animation
- Error handling for invalid usernames
- API rate limit handling

### 🕒 Recent Searches
- Stores search history using Local Storage
- Autocomplete suggestions
- Quick access to previous searches

### 🎨 Theme Support
- Dark Mode
- Light Mode
- Theme preference saved automatically

### 📱 Responsive Design
- Desktop
- Tablet
- Mobile friendly

---

# 🛠️ Tech Stack

- HTML5
- CSS3
- JavaScript (ES6)
- GitHub REST API
- Local Storage

---

# 📁 Folder Structure

```
DevScope/
│
├── index.html
├── index.css
├── index.js
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-github-username/devscope.git
```

## 2. Open the Project

Simply open:

```
index.html
```

or use **VS Code Live Server**.

---

# 🔥 GitHub API Endpoints

### User Profile

```
https://api.github.com/users/{username}
```

### User Repositories

```
https://api.github.com/users/{username}/repos?per_page=100&sort=stars&order=desc
```

---

# 📷 Application Preview

### Home Page
- Hero section
- Search bar
- Theme toggle
- Recent searches

### Profile Dashboard
- User information
- Statistics
- GitHub profile button

### Repository Section
- Repository cards
- Repository metadata
- Show More button

---

# 💡 Key Functionalities

- Live GitHub API Integration
- Async/Await
- Fetch API
- DOM Manipulation
- CSS Variables
- Responsive Grid Layout
- Local Storage
- Theme Switching
- Loading Screen
- Error Handling
- Repository Pagination

---

# 🚀 Future Improvements

- Compare two GitHub profiles
- GitHub contribution graph
- Repository filtering
- Repository search
- Language usage chart
- Commit activity analytics
- Organization support
- GitHub OAuth Login
- Export profile as PDF
- Developer score calculation

---

# ⚠️ API Rate Limit

This project uses the public GitHub REST API.

Without authentication:

- **60 requests/hour** per IP address

To increase the limit, use a GitHub Personal Access Token.

---

# 📚 What I Learned

During this project, I gained hands-on experience with:

- REST APIs
- JavaScript Fetch API
- Async Programming
- Responsive Web Design
- Local Storage
- Dynamic DOM Rendering
- Event Handling
- CSS Animations
- Theme Management
- Error Handling

---

# 👨‍💻 Author

**Harsh Sharma**

GitHub: https://github.com/your-github-username

---

# 📄 License

This project is created for educational and portfolio purposes.

---

## ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star** on GitHub.
