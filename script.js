document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('logo');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    // 사용자가 제공한 '웹에 게시' URL
    // CORS 문제를 우회하기 위해 프록시 서버를 사용하지 않고 직접 접근을 시도합니다.
    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';

    // CSV 데이터를 파싱하는 함수
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return { columnIndices: {}, data: [] };

        const headerLine = lines[0];
        const rawHeaderCells = headerLine.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').trim());

        const columnIndices = {};
        // Find the indices of the relevant columns in the header
        columnIndices['연도'] = rawHeaderCells.indexOf('연도');
        columnIndices['차수'] = rawHeaderCells.indexOf('차수');
        columnIndices['기간'] = rawHeaderCells.indexOf('ME 주말 날짜'); // Map 'ME 주말 날짜' to '기간'
        columnIndices['본당'] = rawHeaderCells.indexOf('본당');
        columnIndices['남편 이름'] = rawHeaderCells.indexOf('남편 이름');
        columnIndices['아내 이름'] = rawHeaderCells.indexOf('아내 이름');

        // Filter out -1 indices (columns not found) and log warnings
        for (const key in columnIndices) {
            if (columnIndices[key] === -1) {
                console.warn(`CSV header column "${key}" not found. Data for this field might be missing.`);
            }
        }

        const dataRows = lines.slice(1).map(line => {
            return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').trim());
        });

        return { columnIndices, data: dataRows };
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
            const { columnIndices, data: rows } = parseCSV(csvText);
            console.log('Parsed Rows (first 5 rows):', rows.slice(0, 5));
            console.log('Column Indices:', columnIndices);
            console.log(`총 ${rows.length}개의 행이 파싱되었습니다.`);

            displayResults(rows, query, columnIndices); // columnIndices 전달

        } catch (error) {
            console.error('데이터 로딩 또는 파싱 오류:', error);
            resultsDiv.innerHTML = '<p>데이터를 가져오는 중 오류가 발생했습니다. 스프레드시트가 웹에 올바르게 게시되었는지, 인터넷 연결이 정상인지 확인하세요.</p>';
        } finally {
            loadingDiv.style.display = 'none'; // 로딩 인디케이터 숨기기
        }
    }

    // 결과 표시 함수 (필터링 및 HTML 생성)
    function displayResults(rows, query, columnIndices) { // columnIndices 받기
        let found = false;
        const lowerCaseQuery = query.toLowerCase(); // 검색어를 소문자로 변경
        console.log('DisplayResults - Search Term:', lowerCaseQuery);

        // Check if essential columns are found
        const husbandNameCol = columnIndices['남편 이름'];
        const wifeNameCol = columnIndices['아내 이름'];
        const yearCol = columnIndices['연도'];
        const sessionCol = columnIndices['차수'];
        const periodCol = columnIndices['기간'];
        const parishCol = columnIndices['본당'];

        if (husbandNameCol === -1 || wifeNameCol === -1) {
            resultsDiv.innerHTML = '<p>필수 열(남편 이름, 아내 이름)을 CSV에서 찾을 수 없습니다. 스프레드시트 헤더를 확인하세요.</p>';
            return;
        }

        // Loop through data rows (header already removed by parseCSV)
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Check if the row has enough columns for the essential fields
            const maxEssentialIndex = Math.max(husbandNameCol, wifeNameCol);
            if (row.length <= maxEssentialIndex) {
                console.log(`Skipping row ${i} due to insufficient length for essential fields:`, row);
                continue; 
            }

            const husbandName = (row[husbandNameCol] || '').toLowerCase();
            const wifeName = (row[wifeNameCol] || '').toLowerCase();
            console.log(`Row ${i} - Husband: ${husbandName}, Wife: ${wifeName}`);

            if (husbandName.includes(lowerCaseQuery) || wifeName.includes(lowerCaseQuery)) {
                console.log(`Match found in row ${i}:`, row);
                found = true;
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <p><strong>남편:</strong> ${row[husbandNameCol] || ''}</p>
                    <p><strong>아내:</strong> ${row[wifeNameCol] || ''}</p>
                    <p><strong>연도:</strong> ${yearCol !== -1 ? (row[yearCol] || '') : 'N/A'}</p>
                    <p><strong>차수:</strong> ${sessionCol !== -1 ? (row[sessionCol] || '') : 'N/A'}</p>
                    <p><strong>기간:</strong> ${periodCol !== -1 ? (row[periodCol] || '') : 'N/A'}</p>
                    <p><strong>본당:</strong> ${parishCol !== -1 ? (row[parishCol] || '') : 'N/A'}</p>
                `;
                resultsDiv.appendChild(resultItem);
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