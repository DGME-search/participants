document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('logo');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    // 1. 구글 스프레드시트에서 '파일' > '공유' > '웹에 게시'를 선택합니다.
    // 2. '전체 문서'를 'CSV(쉼표로 구분된 값)' 형식으로 게시합니다.
    // 3. 생성된 URL을 아래에 붙여넣으세요.
    const WEB_PUBLISHED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';

    let sheetData = [];

    // CSV 데이터를 배열로 변환하는 함수
    function csvToArray(csv) {
        const rows = csv.split(/\r?\n/);
        return rows.map(row => row.split(','));
    }

    // 데이터 로드 함수
    async function loadSheetData() {
        if (!WEB_PUBLISHED_URL || WEB_PUBLISHED_URL === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv') {
            resultsDiv.innerHTML = '<p>스크립트 파일(script.js)에 웹에 게시된 URL을 입력해주세요.</p>';
            return;
        }

        loadingDiv.style.display = 'block';
        try {
            // CORS 문제를 피하기 위해 no-cors 모드를 사용할 수 있지만, 이 경우 응답이 불투명(opaque)해져
            // 직접적인 데이터 접근이 어려울 수 있습니다. 대부분의 웹 게시 시나리오에서는 잘 동작합니다.
            const response = await fetch(WEB_PUBLISHED_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const csvText = await response.text();
            sheetData = csvToArray(csvText);

        } catch (error) {
            console.error('Error fetching sheet data:', error);
            resultsDiv.innerHTML = '<p>데이터를 불러오는 데 실패했습니다. 웹 게시 URL을 확인하거나, CORS 정책 문제를 확인하세요.</p>';
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    // 검색 및 결과 표시 함수
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        resultsDiv.innerHTML = '';

        if (!searchTerm) {
            return; // 검색어가 없으면 아무것도 하지 않음
        }

        if (sheetData.length === 0) {
            resultsDiv.innerHTML = '<p>데이터가 없거나 로드되지 않았습니다.</p>';
            return;
        }

        // 첫 번째 행(헤더)은 검색에서 제외할 수 있습니다 (필요 시).
        const dataToSearch = sheetData.slice(1);

        const filteredResults = dataToSearch.filter(row => {
            if (row.length < 11) return false; // 데이터 행의 길이가 충분한지 확인
            const husbandName = (row[8] || '').toLowerCase(); // I열: 남편 이름
            const wifeName = (row[10] || '').toLowerCase();    // K열: 아내 이름
            return husbandName.includes(searchTerm) || wifeName.includes(searchTerm);
        });

        if (filteredResults.length > 0) {
            filteredResults.forEach(row => {
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
            });
        } else {
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
    });

    // 페이지 로드 시 데이터 불러오기
    loadSheetData();
});