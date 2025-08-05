 1 document.addEventListener('DOMContentLoaded', () => {
     2     const logo = document.getElementById('logo');
     3     const searchButton = document.getElementById('searchButton');
     4     const searchInput = document.getElementById('searchInput');
     5     const resultsDiv = document.getElementById('results');
     6     const loadingDiv = document.getElementById('loading');
     7
     8     // 사용자가 제공한 '웹에 게시' URL
     9     const SPREADSHEET_URL =
       'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56
       /pub?gid=1039371593&single=true&output=csv';
    10
    11     /**
    12      * CSV 텍스트를 파싱하는 함수 (수정됨)
    13      * 따옴표로 묶인 필드 안의 쉼표를 올바르게 처리합니다.
    14      */
    15     function parseCSV(text) {
    16         const lines = text.trim().split('\n');
    17         // CSV의 각 줄을 분리하는 정규식. 따옴표 안의 쉼표는 무시합니다.
    18         const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    19
    20         // 첫 4줄은 헤더 등이므로 건너뜁니다.
    21         return lines.slice(4).map(line => {
    22             return line.split(regex).map(cell => {
    23                 // 각 셀의 앞뒤 공백과 따옴표를 제거합니다.
    24                 return cell.trim().replace(/^"|"$/g, '').trim();
    25             });
    26         });
    27     }
    28
    29     // 검색 및 결과 표시 함수 (데이터 로드 포함)
    30     async function performSearch() {
    31         const query = searchInput.value.trim();
    32         resultsDiv.innerHTML = ''; // 이전 검색 결과 지우기
    33
    34         if (!query) {
    35             alert('검색할 이름을 입력해주세요.');
    36             return;
    37         }
    38
    39         console.log(`검색어: "${query}"`);
    40         loadingDiv.style.display = 'block'; // 로딩 인디케이터 표시
    41
    42         try {
    43             const response = await fetch(SPREADSHEET_URL);
    44             console.log('Fetch Response Status:', response.status, response.statusText);
    45             if (!response.ok) {
    46                 throw new Error(`Network response was not ok: ${response.statusText}`);
    47             }
    48             const csvText = await response.text();
    49             console.log('Raw CSV Text (first 500 chars):', csvText.substring(0, 500));
    50             console.log("CSV 데이터 로드 성공.");
    51             const rows = parseCSV(csvText);
    52             console.log('Parsed Rows (first 5 rows):', rows.slice(0, 5));
    53             console.log(`총 ${rows.length}개의 행이 파싱되었습니다.`);
    54
    55             displayResults(rows, query);
    56
    57         } catch (error) {
    58             console.error('데이터 로딩 또는 파싱 오류:', error);
    59             resultsDiv.innerHTML = '<p>데이터를 가져오는 중 오류가 발생했습니다. 스프레드시트가 웹에 올바르게 게시되었는지,
       인터넷 연결이 정상인지 확인하세요.</p>';
    60         } finally {
    61             loadingDiv.style.display = 'none'; // 로딩 인디케이터 숨기기
    62         }
    63     }
    64
    65     // 결과 표시 함수 (필터링 및 HTML 생성)
    66     function displayResults(rows, query) {
    67         let found = false;
    68         const lowerCaseQuery = query.toLowerCase(); // 검색어를 소문자로 변경
    69         console.log('DisplayResults - Search Term:', lowerCaseQuery);
    70
    71         for (let i = 0; i < rows.length; i++) {
    72             const row = rows[i];
    73
    74             if (row.length < 11) {
    75                 console.log(`Skipping row ${i} due to insufficient length:`, row);
    76                 continue;
    77             }
    78
    79             const husbandName = (row[8] || '').toLowerCase(); // 남편 이름 (인덱스 8)
    80             const wifeName = (row[10] || '').toLowerCase();   // 아내 이름 (인덱스 10)
    81             // 디버깅을 위해 파싱된 이름을 출력합니다.
    82             if (i < 5) { // 처음 5개 행만 로그 출력
    83                  console.log(`Row ${i} - Parsed Husband: ${husbandName}, Parsed Wife: ${wifeName}`);
    84             }
    85
    86             if (husbandName.includes(lowerCaseQuery) || wifeName.includes(lowerCaseQuery)) {
    87                 console.log(`Match found in row ${i}:`, row);
    88                 found = true;
    89                 const resultItem = document.createElement('div');
    90                 resultItem.className = 'result-item';
    91                 resultItem.innerHTML = `
    92                     <p><strong>남편:</strong> ${row[8] || ''}</p>
    93                     <p><strong>아내:</strong> ${row[10] || ''}</p>
    94                     <p><strong>연도:</strong> ${row[0] || ''}</p>
    95                     <p><strong>차수:</strong> ${row[2] || ''}</p>
    96                     <p><strong>기간:</strong> ${row[3] || ''}</p>
    97                     <p><strong>본당:</strong> ${row[7] || ''}</p>
    98                 `;
    99                 resultsDiv.appendChild(resultItem);
   100             }
   101         }
   102
   103         if (!found) {
   104             console.log('No search results found.');
   105             resultsDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
   106         }
   107     }
   108
   109     // 이벤트 리스너
   110     searchButton.addEventListener('click', performSearch);
   111     searchInput.addEventListener('keyup', (event) => {
   112         if (event.key === 'Enter') {
   113             performSearch();
   114         }
   115     });
   116
   117     // 로고 클릭 시 초기화 및 시작 화면으로 돌아가기
   118     logo.addEventListener('click', () => {
   119         searchInput.value = ''; // 검색창 비우기
   120         resultsDiv.innerHTML = ''; // 검색 결과 지우기
   121         location.reload();
   122     });
   123 });