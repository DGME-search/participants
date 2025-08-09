document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');

    const searchButton = document.getElementById('searchButton');

    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';
    let data = [];

    // 쉼표(,)가 포함된 필드를 올바르게 처리하기 위한 CSV 파싱 함수
    function parseCsvRow(row) {
        const columns = [];
        let currentColumn = '';
        let inQuotes = false;
        // "로 시작하고 끝나는 필드 내의 쉼표를 무시하기 위한 로직
        for (const char of row) {
            if (char === '"' && (currentColumn.length === 0 || currentColumn.endsWith(','))) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                columns.push(currentColumn.trim());
                currentColumn = '';
            } else {
                currentColumn += char;
            }
        }
        columns.push(currentColumn.trim());
        return columns;
    }

    // 데이터 로드 및 파싱
    async function loadData() {
        try {
            const response = await fetch(SPREADSHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            // CSV 파싱: 첫 줄(헤더)은 건너뛰고, 각 줄을 객체로 변환
            data = csvText.split('\n').slice(1).map(row => {
                if (!row) return null; // 빈 줄은 건너뛰기
                const columns = parseCsvRow(row);
                
                // 데이터가 올바르게 파싱되었는지 확인
                if (columns.length < 13) return null;

                return {
                    year: columns[0],
                    session: columns[2],
                    period: columns[3],
                    husband: columns[8],
                    wife: columns[10],
                    parish: columns[7],
                };
            }).filter(item => item !== null); // null인 항목(빈 줄 등)은 최종 데이터에서 제거
        } catch (error) {
            console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
            resultsContainer.innerHTML = '<p class="no-results">데이터를 불러오는 데 실패했습니다. 인터넷 연결을 확인해주세요.</p>';
        }
    }

    // 검색 및 결과 표시
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm.length === 0) {
            resultsContainer.innerHTML = ''; // 검색어가 없으면 결과창 비우기
            return;
        }

        const filteredData = data.filter(item => 
            (item.husband && item.husband.toLowerCase().includes(searchTerm)) || 
            (item.wife && item.wife.toLowerCase().includes(searchTerm))
        );

        displayResults(filteredData);
    }

    // 결과를 화면에 표시
    function displayResults(results) {
        resultsContainer.innerHTML = ''; // 이전 결과 초기화

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
            return;
        }

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            // 보안을 위해 textContent를 사용하여 텍스트를 안전하게 삽입
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

    // 검색 버튼 클릭 또는 Enter 키 입력 시 검색 실행
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // 페이지 로드 시 데이터 불러오기
    loadData();
});