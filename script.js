document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSe9g03z8yLlRw7PQc0a2ykmIrGMVqGEjQK9CPMUEhAV261Pje_usOlqSkB366UKszSZPpFlIGIrmzk/pub?gid=0&single=true&output=csv';
    let data = [];

    async function loadData() {
        loadingIndicator.style.display = 'block';
        resultsContainer.innerHTML = '';
        try {
            const response = await fetch(SPREADSHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            
            const rows = csvText.split(/\r?\n/);

            data = rows.slice(1).map(row => {
                if (!row) return null;

                const columns = row.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g);
                
                if (!columns || columns.length < 9) return null;

                const cleanedColumns = columns.map(col => {
                    let clean = col.trim();
                    if (clean.endsWith(',')) {
                        clean = clean.slice(0, -1);
                    }
                    if (clean.startsWith('"') && clean.endsWith('"')) {
                        clean = clean.slice(1, -1).replace(/""/g, '"');
                    }
                    return clean;
                });

                return {
                    session: cleanedColumns[1],
                    period: cleanedColumns[2],
                    parish: cleanedColumns[5],
                    husband: cleanedColumns[6],
                    wife: cleanedColumns[8],
                };
            }).filter(item => item);

        } catch (error) {
            resultsContainer.innerHTML = '<p class="no-results">데이터를 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            resultsContainer.innerHTML = '';
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredData = data.filter(item => {
            // 모든 열의 데이터를 합쳐서 검색
            const allDataString = Object.values(item).join(' ').toLowerCase();
            return allDataString.includes(lowerCaseSearchTerm);
        });

        displayResults(filteredData, searchTerm);
    }

    function displayResults(results, searchTerm) {
        resultsContainer.innerHTML = '';
        if (results.length === 0) {
            resultsContainer.innerHTML = `<p class="no-results">'${escapeHTML(searchTerm)}'에 대한 검색 결과가 없습니다.</p>`;
            return;
        }

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <p><strong>남편:</strong> ${escapeHTML(item.husband)}</p>
                <p><strong>아내:</strong> ${escapeHTML(item.wife)}</p>
                <p><strong>차수:</strong> ${escapeHTML(item.session)}</p>
                <p><strong>기간:</strong> ${escapeHTML(item.period)}</p>
                <p><strong>본당:</strong> ${escapeHTML(item.parish)}</p>
            `;
            resultsContainer.appendChild(resultItem);
        });
    }

    // XSS 방지를 위한 간단한 HTML 이스케이프 함수
    function escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    loadData();
});