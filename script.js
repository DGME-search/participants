document.addEventListener('DOMContentLoaded', function() {
    // 검색 버튼 클릭 이벤트
    document.getElementById('searchButton').addEventListener('click', performSearch);
    
    // 엔터 키 이벤트
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 로고 클릭 이벤트
    document.getElementById('logo').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('results').innerHTML = '';
    });
});

// CSV 데이터를 가져오는 함수
async function fetchCSVData() {
    try {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error('데이터를 불러오는 데 문제가 발생했습니다.');
        }
        
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('데이터 로딩 에러:', error);
        return [];
    }
}

// CSV 파싱 함수
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // 인덱스 찾기 (남편 이름, 아내 이름, 연도, 차수, 기간, 본당)
    const husbandIndex = headers.findIndex(header => header.includes('남편'));
    const wifeIndex = headers.findIndex(header => header.includes('아내'));
    const yearIndex =