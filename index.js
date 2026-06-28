const usernameInput = document.getElementById('usernameInput');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const userProfile = document.getElementById('userProfile');
const repositoriesSection = document.getElementById('repositoriesSection');
const repositoriesContainer = document.getElementById('repositoriesContainer');
const hero = document.querySelector('.hero');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const recentSuggestions = document.getElementById('recentSuggestions');
const recentSearchesList = document.getElementById('recentSearches');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');
const repoControls = document.getElementById('repoControls');
const typingText = document.getElementById('typingText');


// Paging state
let currentRepos = [];
let currentRepoIndex = 0;
const REPOS_BATCH_SIZE = 9;

let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;

function typeAnimation() {
    const phrase = typingPhrases[currentPhraseIndex];
    const displayText = isDeleting ? phrase.substring(0, currentCharIndex) : phrase.substring(0, currentCharIndex);
    
    typingText.textContent = displayText;
    
    if (!isDeleting && currentCharIndex === phrase.length) {
        setTimeout(() => {
            isDeleting = true;
            typeAnimation();
        }, 3000);
        return;
    }
    
    if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % typingPhrases.length;
        setTimeout(typeAnimation, 500);
        return;
    }
    
    currentCharIndex += isDeleting ? -1 : 1;
    setTimeout(typeAnimation, isDeleting ? 30 : 50);
}

// Start typing animation on page load
window.addEventListener('load', () => {
    setTimeout(typeAnimation, 500);
});

// Theme Toggle Functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}
initTheme();
themeToggle.addEventListener('click', toggleTheme);

function showLoading() {
    loadingIndicator.classList.remove('hidden');
    userProfile.classList.add('hidden');
    repositoriesSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    hero.classList.add('hidden');
    hideAutocomplete();
}


function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    userProfile.classList.add('hidden');
    repositoriesSection.classList.add('hidden');
    hero.classList.add('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(value) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(n)) return '0';
    return n.toLocaleString();
}

function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function hideAutocomplete() {
    autocompleteDropdown.classList.add('hidden');
    recentSearchesList.classList.add('hidden');
}


function showAutocompleteList(items) {
    autocompleteDropdown.innerHTML = '';

    if (!items || items.length === 0) {
        hideAutocomplete();
        return;
    }

    items.forEach(name => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        li.tabIndex = 0;
        li.textContent = name;
        li.addEventListener('click', () => {
            usernameInput.value = name;
            hideAutocomplete();
            handleSearch();
        });
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                usernameInput.value = name;
                hideAutocomplete();
                handleSearch();
            }
        });
        autocompleteDropdown.appendChild(li);
    });

    autocompleteDropdown.classList.remove('hidden');
    recentSearchesList.classList.add('hidden');
}
async function fetchUserData(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('User not found');
        }
        if (response.status === 403 && data && /rate limit/i.test(data.message || '')) {
            throw new Error('API rate limit exceeded. Try again later or authenticate with a token.');
        }
        throw new Error(data && data.message ? data.message : `API Error: ${response.status}`);
    }

    return data;
}

async function fetchUserRepositories(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars&order=desc`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 403 && data && /rate limit/i.test(data.message || '')) {
            throw new Error('API rate limit exceeded. Try again later or authenticate with a token.');
        }
        throw new Error(data && data.message ? data.message : `Failed to fetch repositories: ${response.status}`);
    }

    return data;
}
function displayUserProfile(userData) {
    document.getElementById('avatar').src = userData.avatar_url || '';
    document.getElementById('avatar').alt = `${userData.login || 'User'}'s avatar`;

    document.getElementById('username').textContent = userData.login || 'N/A';

    const displayNameEl = document.getElementById('displayName');
    if (userData.name) {
        displayNameEl.textContent = userData.name;
        displayNameEl.classList.remove('hidden');
    } else {
        displayNameEl.classList.add('hidden');
    }

    const bioEl = document.getElementById('bio');
    if (userData.bio) {
        bioEl.textContent = userData.bio;
        bioEl.classList.remove('hidden');
    } else {
        bioEl.classList.add('hidden');
    }

    const locationEl = document.getElementById('location');
    if (userData.location) {
        locationEl.textContent = userData.location;
        locationEl.classList.remove('hidden');
    } else {
        locationEl.classList.add('hidden');
    }

    const companyEl = document.getElementById('company');
    if (userData.company) {
        companyEl.textContent = userData.company;
        companyEl.classList.remove('hidden');
    } else {
        companyEl.classList.add('hidden');
    }

    const websiteEl = document.getElementById('website');
    if (userData.blog) {
        websiteEl.textContent = userData.blog;
        websiteEl.href = userData.blog;
        websiteEl.classList.remove('hidden');
    } else {
        websiteEl.classList.add('hidden');
    }

    const joinDateEl = document.getElementById('joinDate');
    const joined = formatDate(userData.created_at);
    if (joined) {
        joinDateEl.textContent = joined;
        joinDateEl.classList.remove('hidden');
    } else {
        joinDateEl.classList.add('hidden');
    }

    document.getElementById('followers').textContent = formatNumber(userData.followers || 0);
    document.getElementById('following').textContent = formatNumber(userData.following || 0);
    document.getElementById('publicRepos').textContent = formatNumber(userData.public_repos || 0);
