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
        resultsDiv.innerHTML = ''; // Clear previous results

        if (!query) {
            alert('검색할 이름을 입력해주세요.');
            return;
        }

        console.log(`검색어: "${query}"`);
        loadingDiv.style.display = 'block'; // Show loading indicator

        try {
            const response = await fetch(SPREADSHEET_URL);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const csvText = await response.text();
            console.log("CSV 데이터 로드 성공.");
            const rows = parseCSV(csvText);
            console.log(`총 ${rows.length}개의 행이 파싱되었습니다.`);

            displayResults(rows, query); // Call the new displayResults

        } catch (error) {
            console.error('데이터 로딩 또는 파싱 오류:', error);
            resultsDiv.innerHTML = '<p>데이터를 가져오는 중 오류가 발생했습니다. 스프레드시트가 웹에 올바르게 게시되었는지, 인터넷 연결이 정상인지 확인하세요.</p>';
        } finally {
            loadingDiv.style.display = 'none'; // Hide loading indicator
        }
    }

    // 결과 표시 함수 (필터링 및 HTML 생성)
    function displayResults(rows, query) {
        let found = false;
        const lowerCaseQuery = query.toLowerCase(); // 검색어를 소문자로 변경

        if (rows.length > 1) { // 헤더를 제외한 데이터가 있는지 확인
            // 첫 번째 행(헤더)은 건너뛰고 검색 (i=1부터 시작)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // 행의 데이터가 충분하지 않으면 건너뜁니다.
                if (row.length < 11) continue; // 데이터 행의 길이가 충분한지 확인

                const husbandName = (row[8] || '').toLowerCase(); // I열: 남편 이름
                const wifeName = (row[10] || '').toLowerCase();    // K열: 아내 이름

                if (husbandName.includes(lowerCaseQuery) || wifeName.includes(lowerCaseQuery)) {
                    found = true;
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.innerHTML = `
                        <p><strong>남편:</strong> ${row[8]}</p>
                        <p><strong>아내:</strong> ${row[10]}</p>
                        <p><strong>연도:</strong> ${row[0]}</p>
                        <p><strong>차수:</strong> ${row[1]}</p>
                        <p><strong>기간:</strong> ${row[2]}</p>
                        <p><strong>본당:</strong> ${row[15]}</p>
                    `;
                    resultsDiv.appendChild(resultItem);
                }
            }
        }

        if (!found) {
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

    // 로고 클릭 시 초기화
    logo.addEventListener('click', () => {
        searchInput.value = ''; // 검색창 비우기
        resultsDiv.innerHTML = ''; // 검색 결과 지우기
        location.reload(); // 페이지 새로고침
    });

    });