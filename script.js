document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');

    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';
    let data = [];

    async function loadData() {
        try {
            const response = await fetch(SPREADSHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            
            data = csvText.split('\n').slice(1).map(row => {
                if (!row) return null;

                // 정규식을 사용하여 쉼표가 포함된 필드를 정확하게 파싱
                const columns = row.match(/("(?:[^"]|"")*"|[^",]*)(,|$)/g);
                
                if (!columns || columns.length < 13) return null;

                // 각 열에서 쉼표와 따옴표를 제거하고 공백을 정리
                const cleanedColumns = columns.map(col => {
                    let clean = col.trim();
                    if (clean.endsWith(',')) {
                        clean = clean.slice(0, -1);
                    }
                    if (clean.startsWith('"') && clean.endsWith('"')) {
                        // 따옴표로 감싸인 필드 내부의 이중 따옴표("")를 단일 따옴표(")로 변환
                        clean = clean.slice(1, -1).replace(/""/g, '"');
                    }
                    return clean;
                });

                return {
                    year: cleanedColumns[0],
                    session: cleanedColumns[1],
                    period: cleanedColumns[7],
                    husband: cleanedColumns[8],
                    wife: cleanedColumns[10],
                    parish: cleanedColumns[12]
                };
            }).filter(item => item); // null 값을 최종 데이터에서 제거

        } catch (error) {
            console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
            resultsContainer.innerHTML = '<p class="no-results">데이터를 불러오는 데 실패했습니다. 인터넷 연결을 확인해주세요.</p>';
        }
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm.length === 0) {
            resultsContainer.innerHTML = '';
            return;
        }

        const filteredData = data.filter(item => 
            (item.husband && item.husband.toLowerCase().includes(searchTerm)) || 
            (item.wife && item.wife.toLowerCase().includes(searchTerm))
        );

        displayResults(filteredData);
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
            return;
        }

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const husbandP = document.createElement('p');
            husbandP.innerHTML = `<strong>남편:</strong>`;
            husbandP.appendChild(document.createTextNode(` ${item.husband || ''}`));

            const wifeP = document.createElement('p');
            wifeP.innerHTML = `<strong>아내:</strong>`;
            wifeP.appendChild(document.createTextNode(` ${item.wife || ''}`));

            const yearP = document.createElement('p');
            yearP.innerHTML = `<strong>연도:</strong>`;
            yearP.appendChild(document.createTextNode(` ${item.year || ''}`));

            const sessionP = document.createElement('p');
            sessionP.innerHTML = `<strong>차수:</strong>`;
            sessionP.appendChild(document.createTextNode(` ${item.session || ''}`));
            
            const periodP = document.createElement('p');
            periodP.innerHTML = `<strong>기간:</strong>`;
            periodP.appendChild(document.createTextNode(` ${item.period || ''}`));

            const parishP = document.createElement('p');
            parishP.innerHTML = `<strong>본당:</strong>`;
            parishP.appendChild(document.createTextNode(` ${item.parish || ''}`));

            resultItem.append(husbandP, wifeP, yearP, sessionP, periodP, parishP);
            resultsContainer.appendChild(resultItem);
        });
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    loadData();
});