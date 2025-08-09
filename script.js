 1 document.addEventListener('DOMContentLoaded', () => {                                      │
 │      2     const searchInput = document.getElementById('searchInput');                            │
 │      3     const resultsContainer = document.getElementById('resultsContainer');                  │
 │      4                                                                                            │
 │      5     const SPREADSHEET_URL =                                                                │
 │        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsbSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlm  │
 │        l765V1sfEEJSt2hl-aiQoJCeJw6Sjg3LQwf2p56/pub?gid=1039371593&single=true&output=csv';        │
 │      6     let data = [];                                                                         │
 │      7                                                                                            │
 │      8     // 데이터 로드 및 파싱                                                                 │
 │      9     async function loadData() {                                                            │
 │     10         try {                                                                              │
 │     11             const response = await fetch(SPREADSHEET_URL);                                 │
 │     12             if (!response.ok) {                                                            │
 │     13                 throw new Error(`HTTP error! status: ${response.status}`);                 │
 │     14             }                                                                              │
 │     15             const csvText = await response.text();                                         │
 │     16             // CSV 파싱: 첫 줄(헤더)은 건너뛰고, 각 줄을 객체로 변환                       │
 │     17             data = csvText.split('\n').slice(1).map(row => {                               │
 │     18                 const columns = row.split(',');                                            │
 │     19                 return {                                                                   │
 │     20                     year: columns[0],       // A열: 연도                                   │
 │     21                     session: columns[1],    // B열: 차수                                   │
 │     22                     period: columns[7],     // H열: 기간                                   │
 │     23                     husband: columns[8],    // I열: 남편                                   │
 │     24                     wife: columns[10],      // K열: 아내                                   │
 │     25                     parish: columns[12],    // M열: 본당                                   │
 │     26                 };                                                                         │
 │     27             });                                                                            │
 │     28         } catch (error) {                                                                  │
 │     29             console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);             │
 │     30             resultsContainer.innerHTML = '<p class="no-results">데이터를 불러오는 데       │
 │        실패했습니다. 인터넷 연결을 확인해주세요.</p>';                                            │
 │     31         }                                                                                  │
 │     32     }                                                                                      │
 │     33                                                                                            │
 │     34     // 검색 및 결과 표시                                                                   │
 │     35     function performSearch() {                                                             │
 │     36         const searchTerm = searchInput.value.trim().toLowerCase();                         │
 │     37                                                                                            │
 │     38         if (searchTerm.length === 0) {                                                     │
 │     39             resultsContainer.innerHTML = ''; // 검색어가 없으면 결과창 비우기              │
 │     40             return;                                                                        │
 │     41         }                                                                                  │
 │     42                                                                                            │
 │     43         const filteredData = data.filter(item =>                                           │
 │     44             (item.husband && item.husband.toLowerCase().includes(searchTerm)) ||           │
 │     45             (item.wife && item.wife.toLowerCase().includes(searchTerm))                    │
 │     46         );                                                                                 │
 │     47                                                                                            │
 │     48         displayResults(filteredData);                                                      │
 │     49     }                                                                                      │
 │     50                                                                                            │
 │     51     // 결과를 화면에 표시                                                                  │
 │     52     function displayResults(results) {                                                     │
 │     53         resultsContainer.innerHTML = ''; // 이전 결과 초기화                               │
 │     54                                                                                            │
 │     55         if (results.length === 0) {                                                        │
 │     56             resultsContainer.innerHTML = '<p class="no-results">검색 결과가                │
 │        없습니다.</p>';                                                                            │
 │     57             return;                                                                        │
 │     58         }                                                                                  │
 │     59                                                                                            │
 │     60         results.forEach(item => {                                                          │
 │     61             const resultItem = document.createElement('div');                              │
 │     62             resultItem.className = 'result-item';                                          │
 │     63                                                                                            │
 │     64             // 보안을 위해 textContent를 사용하여 텍스트를 안전하게 삽입                   │
 │     65             const husbandP = document.createElement('p');                                  │
 │     66             husbandP.innerHTML = `<strong>남편:</strong>`;                                 │
 │     67             husbandP.appendChild(document.createTextNode(` ${item.husband || ''}`));       │
 │     68                                                                                            │
 │     69             const wifeP = document.createElement('p');                                     │
 │     70             wifeP.innerHTML = `<strong>아내:</strong>`;                                    │
 │     71             wifeP.appendChild(document.createTextNode(` ${item.wife || ''}`));             │
 │     72                                                                                            │
 │     73             const yearP = document.createElement('p');                                     │
 │     74             yearP.innerHTML = `<strong>연도:</strong>`;                                    │
 │     75             yearP.appendChild(document.createTextNode(` ${item.year || ''}`));             │
 │     76                                                                                            │
 │     77             const sessionP = document.createElement('p');                                  │
 │     78             sessionP.innerHTML = `<strong>차수:</strong>`;                                 │
 │     79             sessionP.appendChild(document.createTextNode(` ${item.session || ''}`));       │
 │     80                                                                                            │
 │     81             const periodP = document.createElement('p');                                   │
 │     82             periodP.innerHTML = `<strong>기간:</strong>`;                                  │
 │     83             periodP.appendChild(document.createTextNode(` ${item.period || ''}`));         │
 │     84                                                                                            │
 │     85             const parishP = document.createElement('p');                                   │
 │     86             parishP.innerHTML = `<strong>본당:</strong>`;                                  │
 │     87             parishP.appendChild(document.createTextNode(` ${item.parish || ''}`));         │
 │     88                                                                                            │
 │     89             resultItem.append(husbandP, wifeP, yearP, sessionP, periodP, parishP);         │
 │     90             resultsContainer.appendChild(resultItem);                                      │
 │     91         });                                                                                │
 │     92     }                                                                                      │
 │     93                                                                                            │
 │     94     // 검색창에 입력할 때마다 검색 실행                                                    │
 │     95     searchInput.addEventListener('input', performSearch);                                  │
 │     96                                                                                            │
 │     97     // 페이지 로드 시 데이터 불러오기                                                      │
 │     98     loadData();                                                                            │
 │     99 });                                                                                        │
 │    100 });                                          
