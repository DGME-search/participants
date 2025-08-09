document.addEventListener('DOMContentLoaded', () => {
    console.log('1. 스크립트 시작, 이벤트 리스너 등록됨');

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');

    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';
    let data = [];

    async function loadData() {
        console.log('2. loadData 함수 시작');
        try {
            console.log('3. 데이터 fetch 시도...');
            const response = await fetch(SPREADSHEET_URL);
            console.log('4. 데이터 fetch 응답 받음', response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            console.log('5. CSV 텍스트 변환 완료, 파싱 시작...');
            
            data = csvText.split('\n').slice(1).map(row => {
                if (!row) return null;
                const columns = row.match(/("(?:[^"]|"")*"|[^",]*)(,|$)/g);
                if (!columns || columns.length < 13) return null;
                const cleanedColumns = columns.map(col => {
                    let clean = col.trim();
                    if (clean.endsWith(',')) clean = clean.slice(0, -1);
                    if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1).replace(/""/g, '"');
                    return clean;
                });
                return {
                    year: cleanedColumns[0],
                    session: cleanedColumns[2],
                    period: cleanedColumns[3],
                    husband: cleanedColumns[8],
                    wife: cleanedColumns[10],
                    parish: cleanedColumns[7],
                };
            }).filter(item => item);

            console.log('6. 데이터 파싱 및 최종 처리 완료');
            console.log('최종 데이터:', data);

        } catch (error) {
            console.error('오류 발생! 스크립트가 catch 블록에서 중단됨:', error);
        }
    }

    function performSearch() {
        // ... (이하 생략)
    }

    function displayResults(results) {
        // ... (이하 생략)
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') performSearch();
    });

    loadData();
});