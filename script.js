     1     document.addEventListener('DOMContentLoaded', () => {
     2     const searchInput = document.getElementById('searchInput');
     3     const searchButton = document.getElementById('searchButton');
     4     const resultsContainer = document.getElementById('resultsContainer');
     5
     6     const SPREADSHEET_URL =
       'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56
       /pub?gid=1039371593&single=true&output=csv';
     7     let data = [];
     8
     9     async function loadData() {
    10         try {
    11             const response = await fetch(SPREADSHEET_URL);
    12             if (!response.ok) {
    13                 throw new Error(`HTTP error! status: ${response.status}`);
    14             }
    15             const csvText = await response.text();
    16
    17             // Windows와 Mac/Linux의 줄바꿈(\r\n, \n) 모두 처리
    18             const rows = csvText.split(/\r?\n/);
    19
    20             data = rows.slice(1).map(row => {
    21                 if (!row) return null;
    22
    23                 const columns = row.match(/(\"(?:[^\"]|\"\")*\"|[^,]*)(,|$)/g);
    24
    25                 // 아내(10번) 열까지 데이터가 있으면 유효 처리 (기존 13개에서 11개로 수정)
    26                 if (!columns || columns.length < 11) return null;
    27
    28                 const cleanedColumns = columns.map(col => {
    29                     let clean = col.trim();
    30                     if (clean.endsWith(',')) {
    31                         clean = clean.slice(0, -1);
    32                     }
    33                     if (clean.startsWith('"') && clean.endsWith('"')) {
    34                         clean = clean.slice(1, -1).replace(/""/g, '"');
    35                     }
    36                     return clean;
    37                 });
    38
    39                 return {
    40                     year: cleanedColumns[0],
    41                     session: cleanedColumns[2],
    42                     period: cleanedColumns[3],
    43                     husband: cleanedColumns[8],
    44                     wife: cleanedColumns[10],
    45                     parish: cleanedColumns[7],
    46                 };
    47             }).filter(item => item);
    48
    49         } catch (error) {
    50             console.error('데이터 로딩 중 오류:', error);
    51             resultsContainer.innerHTML = '<p class="no-results">데이터를 불러오는 데 실패했습니다. 네트워크 연결을
       확인해주세요.</p>';
    52         }
    53     }
    54
    55     function performSearch() {
    56         const searchTerm = searchInput.value.trim().toLowerCase();
    57         if (searchTerm.length === 0) {
    58             resultsContainer.innerHTML = '';
    59             return;
    60         }
    61         const filteredData = data.filter(item =>
    62             (item.husband && item.husband.toLowerCase().includes(searchTerm)) ||
    63             (item.wife && item.wife.toLowerCase().includes(searchTerm))
    64         );
    65         displayResults(filteredData);
    66     }
    67
    68     function displayResults(results) {
    69         resultsContainer.innerHTML = '';
    70         if (results.length === 0) {
    71             resultsContainer.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
    72             return;
    73         }
    74         results.forEach(item => {
    75             const resultItem = document.createElement('div');
    76             resultItem.className = 'result-item';
    77             const husbandP = document.createElement('p');
    78             husbandP.innerHTML = `<strong>남편:</strong>`;
    79             husbandP.appendChild(document.createTextNode(` ${item.husband || ''}`));
    80             const wifeP = document.createElement('p');
    81             wifeP.innerHTML = `<strong>아내:</strong>`;
    82             wifeP.appendChild(document.createTextNode(` ${item.wife || ''}`));
    83             const yearP = document.createElement('p');
    84             yearP.innerHTML = `<strong>연도:</strong>`;
    85             yearP.appendChild(document.createTextNode(` ${item.year || ''}`));
    86             const sessionP = document.createElement('p');
    87             sessionP.innerHTML = `<strong>차수:</strong>`;
    88             sessionP.appendChild(document.createTextNode(` ${item.session || ''}`));
    89             const periodP = document.createElement('p');
    90             periodP.innerHTML = `<strong>기간:</strong>`;
    91             periodP.appendChild(document.createTextNode(` ${item.period || ''}`));
    92             const parishP = document.createElement('p');
    93             parishP.innerHTML = `<strong>본당:</strong>`;
    94             parishP.appendChild(document.createTextNode(` ${item.parish || ''}`));
    95             resultItem.append(husbandP, wifeP, yearP, sessionP, periodP, parishP);
    96             resultsContainer.appendChild(resultItem);
    97         });
    98     }
    99
   100     searchButton.addEventListener('click', performSearch);
   101     searchInput.addEventListener('keyup', (event) => {
   102         if (event.key === 'Enter') {
   103             performSearch();
   104         }
   105     });
   106
   107     loadData();
   108 });
