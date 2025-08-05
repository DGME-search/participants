   1 const SPREADSHEET_URL =
   2
     'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs
     bSBEIpAUVChiBI6qs14orYM2fUiRoarUzeYlml765V1sfEEJSt2h
     l-aiQoJCeJw6Sjg3LQwf2p56
   3   /pub?gid=1039371593&single=true&output=csv';
  자바스크립트는 ' 로 시작한 문자열이 같은 줄에서 끝나지 않으면
   문법 오류로 인식합니다. 이것이 Uncaught SyntaxError의
  직접적인 원인입니다.

  또한, 이전에 수정해 드렸던 데이터 항목과 열(인덱스) 번호가
  일치하지 않는 문제도 현재 코드에 다시 반영되어 있습니다.

  해결 방법

  아래는 위의 두 가지 문제(URL 문법 오류, 데이터 인덱스 오류)를
   모두 해결한 최종 스크립트입니다.

  기존 script.js 파일의 모든 내용을 삭제하고, 아래 코드로
  완전히 교체해 주세요.

   ... first 38 lines hidden ...
    26     // 검색 및 결과 표시 함수 (데이터 로드 포함)
    27     async function performSearch() {
    28         const query = searchInput.value.trim();
    29         resultsDiv.innerHTML = '';
    30
    31         if (!query) {
    32             alert('검색할 이름을 입력해주세요.');
    33             return;
    34         }
    35
    36         console.log(`검색어: "${query}"`);
    37         loadingDiv.style.display = 'block';
    38
    39         try {
    40             const response = await fetch(
       SPREADSHEET_URL);
    41             if (!response.ok) {
    42                 throw new Error(`Network response
       was not ok: ${response.statusText}`);
    43             }
    44             const csvText = await response.text();
    45             const rows = parseCSV(csvText);
    46             console.log(`총 ${rows.length}개의
       행이 파싱되었습니다.`);
    47
    48             displayResults(rows, query);
    49
    50         } catch (error) {
    51             console.error('데이터 로딩 또는 파싱
       오류:', error);
    52             resultsDiv.innerHTML = '<p>데이터를
       가져오는 중 오류가 발생했습니다. 다시 시도해
       주세요.</p>';
    53         } finally {
    54             loadingDiv.style.display = 'none';
    55         }
    56     }
    57
    58     /**
    59      * 결과 표시 함수 (수정됨)
    60      * 정확한 데이터 열(인덱스)을 사용하도록 다시
       수정했습니다.
    61      */
    62     function displayResults(rows, query) {
    63         let found = false;
    64         const lowerCaseQuery = query.toLowerCase
       ();
    65         console.log('DisplayResults - Search
       Term:', lowerCaseQuery);
    66
    67         for (let i = 0; i < rows.length; i++) {
    68             const row = rows[i];
    69
    70             if (row.length < 11) {
    71                 continue;
    72             }
    73
    74             // [수정됨] 검색할 이름의 인덱스를
       9번(남편), 10번(아내)으로 지정
    75             const husbandName = (row[9] || '').
       toLowerCase();
    76             const wifeName = (row[10] || '').
       toLowerCase();
    77
    78             if (husbandName.includes
       (lowerCaseQuery) || wifeName.includes
       (lowerCaseQuery)) {
    79                 found = true;
    80                 const resultItem = document.
       createElement('div');
    81                 resultItem.className =
       'result-item';
    82
    83                 // [수정됨] 화면에 표시할 데이터의
       인덱스를 바로잡았습니다.
    84                 resultItem.innerHTML = `
    85                     <p><strong>남편:</strong>
       ${row[9] || ''}</p>
    86                     <p><strong>아내:</strong>
       ${row[10] || ''}</p>
    87                     <p><strong>연도:</strong>
       ${row[0] || ''}</p>
    88                     <p><strong>차수:</strong>
       ${row[8] || ''}</p>
    89                     <p><strong>기간:</strong>
       ${row[7] || ''}</p>
    90                     <p><strong>본당:</strong>
       ${row[3] || ''}</p>
    91                 `;
    92                 resultsDiv.appendChild
       (resultItem);
    93             }
    94         }
    95
    96         if (!found) {
    97             console.log('No search results found.'
       );
    98             resultsDiv.innerHTML = '<p>검색 결과가
       없습니다.</p>';
    99         }
   100     }
   101
   102     // 이벤트 리스너
   103     searchButton.addEventListener('click',
       performSearch);
   104     searchInput.addEventListener('keyup', (event)
       => {
   105         if (event.key === 'Enter') {
   106             performSearch();
   107         }
   108     });
   109
   110     // 로고 클릭 시 초기화
   111     logo.addEventListener('click', () => {
   112         searchInput.value = '';
   113         resultsDiv.innerHTML = '';
   114         location.reload();
   115     });
   116 });