document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('logo');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    // 사용자가 제공한 '웹에 게시' URL
    // CORS 문제를 우회하기 위해 프록시 서버를 사용합니다.
    const SPREADSHEET_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv')}`;

    // CSV 데이터를 파싱하는 함수
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        return lines.map(line =>
            line.split(',').map(cell =>
                cell.trim().replace(/^"|"$/g, '').trim()
            )
        );
    }

    // 검색 및 결과 표시 함수 (데이터 로드 포함)
    async function performSearch() {
        const query = searchInput.value.trim();
        resultsDiv.innerHTML = ''; // 이전 검색 결과 지우기

        if (!query) {
            alert('검색할 이름을 입력해주세요.');
            return;
        }

        console.log(`검색어: "${query}"`);
        loadingDiv.style.display = 'block'; // 로딩 인디케이터 표시

        try {
            const response = await fetch(SPREADSHEET_URL);
            console.log('Fetch Response Status:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const csvText = await response.text();
            console.log('Raw CSV Text (first 500 chars):', csvText.substring(0, 500));
            console.log("CSV 데이터 로드 성공.");
            const rows = parseCSV(csvText);
            console.log('Parsed Rows (first 5 rows):', rows.slice(0, 5));
            console.log(`총 ${rows.length}개의 행이 파싱되었습니다.`);

            displayResults(rows, query); // 새로운 displayResults 함수 호출

        } catch (error) {
            console.error('데이터 로딩 또는 파싱 오류:', error);
            resultsDiv.innerHTML = '<p>데이터를 가져오는 중 오류가 발생했습니다. 스프레드시트가 웹에 올바르게 게시되었는지, 인터넷 연결이 정상인지 확인하세요.</p>';
        } finally {
            loadingDiv.style.display = 'none'; // 로딩 인디케이터 숨기기
        }
    }

    // 결과 표시 함수 (필터링 및 HTML 생성)
    function displayResults(rows, query) {
        let found = false;
        const lowerCaseQuery = query.toLowerCase(); // 검색어를 소문자로 변경
        console.log('DisplayResults - Search Term:', lowerCaseQuery);

        if (rows.length > 1) { // 헤더를 제외한 데이터가 있는지 확인
            // 첫 번째 행(헤더)은 건너뛰고 검색 (i=1부터 시작)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // 데이터 행의 길이가 충분한지 확인 (최소한 남편 이름과 아내 이름 열이 있어야 함)
                if (row.length < 7) {
                    console.log(`Skipping row ${i} due to insufficient length:`, row);
                    continue; 
                }

                const husbandName = (row[5] || '').toLowerCase(); // 남편 이름
                const wifeName = (row[6] || '').toLowerCase();    // 아내 이름
                console.log(`Row ${i} - Husband: ${husbandName}, Wife: ${wifeName}`);

                if (husbandName.includes(lowerCaseQuery) || wifeName.includes(lowerCaseQuery)) {
                    console.log(`Match found in row ${i}:`, row);
                    found = true;
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.innerHTML = `
                        <p><strong>남편:</strong> ${row[5]}</p>
                        <p><strong>아내:</strong> ${row[6]}</p>
                        <p><strong>연도:</strong> ${row[0]}</p>
                        <p><strong>차수:</strong> ${row[3]}</p>
                        <p><strong>기간:</strong> ${row[2]}</p>
                        <p><strong>본당:</strong> ${row[4]}</p>
                    `;
                    resultsDiv.appendChild(resultItem);
                }
            }
        }

        if (!found) {
            console.log('No search results found.');
            resultsDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
        }
    }

    // 이벤트 리스너
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // 로고 클릭 시 초기화 및 시작 화면으로 돌아가기
    logo.addEventListener('click', () => {
        searchInput.value = ''; // 검색창 비우기
        resultsDiv.innerHTML = ''; // 검색 결과 지우기
        // 페이지를 새로고침하여 초기 상태로 돌아갑니다.
        location.reload(); 
    });
});