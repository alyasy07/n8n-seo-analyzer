const resultContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error');
const keywordInput = document.getElementById('keywordInput');
const analyzeBtn = document.getElementById('analyzeBtn');

// PLACEHOLDER: Replace with your actual n8n webhook URL
const N8N_WEBHOOK_URL = 'https://ysnouri.app.n8n.cloud/webhook/analyze';

analyzeBtn.addEventListener('click', async () => {
    const keyword = keywordInput.value.trim();
    if (!keyword) return;

    // Reset UI
    errorContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    analyzeBtn.disabled = true;

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword: keyword })
        });

        if (!response.ok) {
            throw new Error('Analysis failed. Please check the n8n workflow.');
        }

        const data = await response.json();
        renderResults(data);

    } catch (error) {
        showError(error.message);
    } finally {
        loadingIndicator.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
});

function renderResults(data) {
    // Expected data structure:
    // {
    //   "summary": "...",
    //   "search_intent": "Informational",
    //   "difficulty_score": 45,
    //   "competitors": ["domain1.com", "domain2.com", "domain3.com"]
    // }

    document.getElementById('summaryText').textContent = data.summary || 'No summary available.';
    document.getElementById('intentBadge').textContent = data.search_intent || 'Unknown';
    // Handle Difficulty Score (AI sometimes returns text)
    let score = data.difficulty_score;
    let isNumber = false;

    if (typeof score === 'string') {
        const numberMatch = score.match(/\d+/);
        // If it starts with a number, assume it's a score
        if (numberMatch && parseInt(numberMatch[0]) <= 100) {
            score = numberMatch[0];
            isNumber = true;
        } else {
            // Keep just the first word (e.g. "High")
            score = score.split('.')[0].split(' ')[0];
        }
    } else if (typeof score === 'number') {
        isNumber = true;
    }

    const difficultyElement = document.getElementById('intentDifficulty');
    if (isNumber) {
        difficultyElement.innerHTML = `Difficulty: <span id="difficultyScore">${score}</span>/100`;
    } else {
        difficultyElement.innerHTML = `Difficulty: <span id="difficultyScore">${score}</span>`;
    }

    const competitorsList = document.getElementById('competitorsList');
    competitorsList.innerHTML = '';

    if (data.competitors && Array.isArray(data.competitors)) {
        data.competitors.forEach(competitor => {
            const li = document.createElement('li');
            li.textContent = competitor;
            competitorsList.appendChild(li);
        });
    } else {
        competitorsList.innerHTML = '<li>No competitors data found.</li>';
    }

    resultContainer.classList.remove('hidden');
}

function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
}
