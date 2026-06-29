
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

const githubLink = document.getElementById('githubLink');
    githubLink.href = userData.html_url || '#';

    hero.classList.add('hidden');
    userProfile.classList.remove('hidden');

function displayRepositories(repositories) {
    repositoriesContainer.innerHTML = '';
    repoControls.innerHTML = '';

    if (!repositories || repositories.length === 0) {
        repositoriesContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No public repositories found.</p>';
        repositoriesSection.classList.remove('hidden');
        return;
    }

    currentRepos = [...repositories].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    currentRepoIndex = 0;
    renderRepoBatch();
    repositoriesSection.classList.remove('hidden');
}

function renderRepoBatch() {
    const end = Math.min(currentRepoIndex + REPOS_BATCH_SIZE, currentRepos.length);
    for (let i = currentRepoIndex; i < end; i++) {
        const repo = currentRepos[i];
        const repoCard = document.createElement('a');
        repoCard.href = repo.html_url;
        repoCard.target = '_blank';
        repoCard.rel = 'noopener noreferrer';
        repoCard.className = 'repo-card';

        const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : '';

        repoCard.innerHTML = `
            <h3 class="repo-name">${escapeHtml(repo.name)}</h3>
            <p class="repo-description">${repo.description ? escapeHtml(repo.description) : '<em>No description</em>'}</p>
            <div class="repo-meta">
                <span class="repo-stars">${repo.stargazers_count || 0}</span>
                <span class="repo-lang">${repo.language ? escapeHtml(repo.language) : '—'}</span>
                <span class="repo-forks">Forks: ${repo.forks_count || 0}</span>
                <span class="repo-updated">Updated: ${escapeHtml(updated)}</span>
            </div>
        `;

        repositoriesContainer.appendChild(repoCard);
    }

    currentRepoIndex = end;

    repoControls.innerHTML = '';
    if (currentRepoIndex < currentRepos.length) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'show-more-btn';
        moreBtn.textContent = `Show more (${currentRepos.length - currentRepoIndex} remaining)`;
        moreBtn.addEventListener('click', () => {
            renderRepoBatch();
        });
        repoControls.appendChild(moreBtn);
    }
}
function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (e) {
        return [];
    }
}

function saveRecentSearches(list) {
    localStorage.setItem('recentSearches', JSON.stringify(list));
}

function addRecentSearch(name) {
    if (!name) return;
    const list = getRecentSearches().filter(n => n.toLowerCase() !== name.toLowerCase());
    list.unshift(name);
    if (list.length > 8) list.pop();
    saveRecentSearches(list);
    renderRecentSearches();
}

function renderRecentSearches() {
    const list = getRecentSearches();
    recentSuggestions.innerHTML = '';
    recentSearchesList.innerHTML = '';

    if (!list || list.length === 0) {
        recentSearchesList.classList.add('hidden');
        return;
    }

    list.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        recentSuggestions.appendChild(option);

        const li = document.createElement('li');
        li.textContent = name;
        li.tabIndex = 0;
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
        recentSearchesList.appendChild(li);
    });

    recentSearchesList.classList.remove('hidden');
}

function goHome() {
    try {
        usernameInput.blur();
    } catch (e) {}

    hideAutocomplete();
    hideError();
    hideLoading();

    userProfile.classList.add('hidden');
    repositoriesSection.classList.add('hidden');
    errorMessage.classList.add('hidden');

    hero.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // keep search input value (recent searches remain available)
}

function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}
async function handleSearch() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Please enter a GitHub username');
        usernameInput.focus();
        return;
    }
    
    try {
        showLoading();
        hideError();
        const [userData, repositories] = await Promise.all([
            fetchUserData(username),
            fetchUserRepositories(username)
        ]);

        hideLoading();

        addRecentSearch(userData.login || username);
        displayUserProfile(userData);
        displayRepositories(repositories);
        
    } catch (error) {
        hideLoading();
        
        if (error.message === 'User not found') {
            showError('User not found');
        } else {
            showError(`Error: ${error.message}`);
        }
        
        console.error('Search error:', error);
    }
}
const homeLogo = document.getElementById('homeLogo');
const homeBtn = document.getElementById('homeBtn');

searchBtn.addEventListener('click', handleSearch);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        hideAutocomplete();
        handleSearch();
    }
});

if (homeLogo) {
    homeLogo.addEventListener('click', (e) => {
        e.preventDefault();
        goHome();
    });
}

if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        goHome();
    });
}

window.addEventListener('load', () => {
    usernameInput.focus();
    renderRecentSearches();
});
usernameInput.addEventListener('input', debounce(() => {
    const val = usernameInput.value.trim();
    if (!val) {
        hideAutocomplete();
        renderRecentSearches();
        return;
    }

    const list = getRecentSearches().filter(n => n.toLowerCase().includes(val.toLowerCase()));

    // Populate datalist for native dropdown support (optional)
    recentSuggestions.innerHTML = '';
    list.slice(0, 8).forEach(n => {
        const option = document.createElement('option');
        option.value = n;
        recentSuggestions.appendChild(option);
    });

    showAutocompleteList(list.slice(0, 8));
}, 200));

usernameInput.addEventListener('focus', () => {
    const val = usernameInput.value.trim();
    if (!val) {
        renderRecentSearches();
        return;
    }
    const list = getRecentSearches().filter(n => n.toLowerCase().includes(val.toLowerCase()));
    showAutocompleteList(list.slice(0, 8));
});

document.addEventListener('click', (e) => {
    const target = e.target;
    const withinAutocomplete = target && (autocompleteDropdown.contains(target) || target === usernameInput);
    if (!withinAutocomplete) {
        hideAutocomplete();
    }
});