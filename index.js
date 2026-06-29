const githubLink = document.getElementById('githubLink');
    githubLink.href = userData.html_url || '#';

    hero.classList.add('hidden');
    userProfile.classList.remove('hidden');
},

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