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


