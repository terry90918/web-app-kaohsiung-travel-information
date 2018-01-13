// 請求資料的網址
var urlForAjax = 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97';
// 全部資料
var records = [];
// 選擇區域資料
var typeData = [];
// 現在顯示資料
var nowData = [];
// 資料長度
var len;
// 分類
var type;
// 現在分頁
var page;

/**
 * 高雄市政府開放資料
 * 透過 AJAX 取得 JSON 資料
 */
function requestData() {
  // 建立一個新的 XMLHttpRequest
  let xhr = new XMLHttpRequest();
  // 設定 xhr 來 get(取得) 放在 高雄市政府開放資料的 JSON 資料值
  xhr.open('get', urlForAjax, true);
  // 送出 xhr 請求
  xhr.send(null);
  // 當取得 xhr 回應, 執行此 function
  xhr.onload = function () {
    // 4: 請求已完成, 響應已就緒. 200: "OK"
    if (xhr.readyState == 4 && xhr.status == 200) {
      let openData = JSON.parse(xhr.responseText);
      records = openData.result.records;
      // 分析網址參數, 帶入渲染函式
      let urlParamsObj = (urlParams() ? urlParams() : {
        type: '',
        page: ''
      });
      renderContent(urlParamsObj.type, urlParamsObj.page);
    } else {
      console.log("資料錯誤!");
    }
  }
}

/**
 * JSDoc參考資料: https://msdn.microsoft.com/zh-tw/library/mt162307.aspx?f=255&MSPPError=-2147217396
 * @description 渲染內容 
 * @param {string} goType 前往的行政區分類
 * @param {number} goPage 前往的頁籤
 * @param {string} isHistoryPopstate 是歷史紀錄觸發的事件嗎? 有傳值則"是"
 */

function renderContent(goType, goPage, isHistoryPopstate) {
  type = goType || 'all';
  page = goPage || 1;

  if (type == 'all') {
    nowData = records;
    len = nowData.length;
  } else {
    upNowData(type);
    nowData = typeData;
    len = nowData.length;
  }
  // 渲染選單
  renderSelect();
  // 渲染卡片模組 > 卡片模組點擊監聽啟動函式
  renderCardModel();
  // 渲染分頁標籤
  renderPage();
  // 如果不是 "返回上一頁", 則執行歷史紀錄更新!
  if (!isHistoryPopstate) {
    historyUpdata();
  }
}

// 渲染下拉選單
function renderSelect() {
  let notRepeating = [];
  let el = document.querySelector('.administrative-select');
  let option = '<option value="" selected disabled hidden>- - 請選擇行政區 - -</option>';

  for (let i = 0; i < records.length; i++) {
    // 1.過濾重複的行政區
    if (notRepeating.indexOf(records[i].Zone) == -1) {
      // 2.整理成陣列
      notRepeating.push(records[i].Zone);
    }
  }

  // 將整理好的陣列渲染到 DOM 上
  for (let i = 0; i < notRepeating.length; i++) {
    option += `<option value="${notRepeating[i]}">${notRepeating[i]}</option>`;
  }
  el.innerHTML = option;
}

// 渲染卡片模組 > 卡片模組點擊監聽啟動函式
function renderCardModel() {
  let start, end;

  if (page == 1) {
    start = 0;
    end = (len > 6 ? 6 : len);
  } else {
    start = (page * 6) - 6;
    end = (len < page * 6 ? len : page * 6);
  }

  let el = document.querySelector('.administrative-cards');
  let cardModel = ``;
  for (let i = start; i < end; i++) {
    cardModel +=
      `<div class="model-card" data-id="${nowData[i].Id}" data-px="${nowData[i].Px}" data-py="${nowData[i].Py}">
      <div class="card-top" style="background-image: url('${nowData[i].Picture1}');">
        <h3>${nowData[i].Name}</h3>
        <h5>${nowData[i].Zone}</h5>
      </div>
      <ul class="card-bottom">
        <li class="time">${nowData[i].Opentime}</li>
        <li class="location">${nowData[i].Add}</li>
        <li class="phoneTag">
          <div class="phone">${nowData[i].Tel}</div>
          ${(nowData[i].Ticketinfo ? '<div class="tag">' + nowData[i].Ticketinfo + '</div>' : '')}
        </li>
      </ul>
    </div>`;
  }
  el.innerHTML = cardModel;

  // 卡片模組點擊監聽啟動函式
  cradrModelAddEventListenClick();
}

// 渲染分頁碼
function renderPage() {
  // 分析頁籤最大數值
  let pageLen = Math.floor(nowData.length % 6) === 0 ?
    (nowData.length / 6) : (Math.floor(nowData.length / 6) === 0 ?
      1 : (Math.floor(nowData.length / 6) + 1));
  let pagination = document.querySelector('.pagination');
  let str = ``;
  // 字串轉數值
  page = parseInt(page);
  if (page == 1) {
    str += `<li class="disable">Prev</li>`;
  } else {
    str += `<li>Prev</li>`;
  }
  if (page >= 4) {
    str += `<li>1</li><li class="disable">...</li>`;
  }

  let start;
  let end;
  if (pageLen > 3) {
    if (page - 2 < 1) {
      start = 1;
      end = page + 2;
    } else if (page + 2 > pageLen) {
      start = page - 2;
      end = pageLen;
    } else {
      start = page - 2;
      end = page + 2;
    }
  } else {
    start = 1;
    end = pageLen;
  }

  for (let i = start; i <= end; i++) {
    if (i == page) {
      str +=
        `<li class="active">${i}</li>`;
    } else {
      str += `<li>${i}</li>`;
    }
  }
  if (page <= pageLen - 3) {
    str +=
      `<li class="disable">...</li>
      <li>${pageLen}</li>`;
  }
  if (page == pageLen) {
    str += `<li class="disable">Next</li>`;
  } else {
    str += `<li>Next</li>`
  }
  pagination.innerHTML = str;
}

// 選擇行政區時 觸發的事件
function selectChange(e) {
  let selectVal = e.target.value;
  let el = document.querySelector('.administrative-title');
  renderContent(selectVal, 1);
}

// 點擊熱門行政區 
function hotChose(e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  let hotVal = e.target.textContent;
  renderContent(hotVal, 1);
}

// 頁面切換
function pageChange(e) {
  if (e.target.nodeName !== 'LI') {
    return;
  } else if (e.target.className === 'disable') {
    return;
  }

  let textContent = e.target.textContent;
  let goPage;
  if (textContent !== 'Prev' && textContent !== 'Next') {
    goPage = parseInt(textContent);
    renderContent(type, goPage);
  } else {
    if (textContent === 'Prev') {
      goPage = page - 1;
    } else {
      goPage = page + 1;
    }
    renderContent(type, goPage);
  }
}

// 網址參數拆解
function urlParams() {
  let urlSearch = window.location.search;
  if (urlSearch) {
    let theRequest = new Object();
    if (urlSearch.indexOf('?') !== -1) {
      let param = urlSearch.split('?')[1];
      if (param.indexOf('&') !== -1) {
        let params = param.split("&");
        for (let i = 0; i < params.length; i++) {
          // 十六進制解碼, 將轉換正確中文
          theRequest[params[i].split('=')[0]] = decodeURI(params[i].split('=')[1]);
        }
      } else {
        theRequest[param.split('=')[0]] = decodeURI(param.split('=')[1]);
      }
    }
    return theRequest;
  } else {
    console.log('網址後面沒有參數!');
  }
}

// 下拉捲軸返回頂端
function goTop() {
  window.scrollTo(0, 0);
}

// 修改網址與新增歷史紀錄
function historyUpdata(e) {
  // 需要先將中文進行十六進制的轉義序列進行替換
  let typeEncodeURI = encodeURI(type);
  let state = {
    'type': typeEncodeURI,
    'page': page
  };
  // 參考資源: https://developer.mozilla.org/zh-TW/docs/Web/API/History_API#pushState()_%E6%96%B9%E6%B3%95
  let title = 'null';
  let url = '?type=' + state.type + '&page=' + state.page;
  history.pushState(state, title, url);
}

// 更新選擇區域資料
function upNowData(goType) {
  let el = document.querySelector('.administrative-title');
  typeData = [];

  el.textContent = goType;
  for (let i = 0; i < records.length; i++) {
    if (records[i].Zone == goType) {
      typeData.push(records[i]);
    }
  }
}


// 點擊卡片模組顯示 Google Map 監聽
// 必須等卡片模組渲染完畢在進行監聽卡片模組點擊事件
function cradrModelAddEventListenClick(e) {
  let administrativeCards = document.querySelector('.administrative-cards');
  administrativeCards.addEventListener('click', function (e) {
    for (let i = 0; i < e.path.length; i++) {
      let elementClassName = e.path[i].className;
      if (elementClassName === "model-card") {
        let cardModel = e.path[i];
        renderModal(cardModel.dataset.id);
      }
    }
  }, false);
}

// 渲染彈出視窗
function renderModal(cardModelId, px, py) {
  for (let i = 0; i < nowData.length; i++) {
    if (nowData[i].Id === cardModelId) {
      let modalContent =
        `<div class="modal-header" style="background-image: url('${nowData[i].Picture1}');">
          <h3>${nowData[i].Name}</h3>
        </div>
        <div class="modal-body">
          <h4>簡介</h4>
          <p>${nowData[i].Description}</p>
          <hr>
          <h4>Google Map</h4>
          <div id="googleMap"></div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn-close">關閉</button>
          <h5>上一次更新時間：${nowData[i].Changetime}</h5>
        </div>`;

      let modal = document.querySelector('.modal');
      modal.innerHTML = modalContent;

      let modalEl = document.querySelector('.modal-el');
      modalEl.classList.add('show');

      let modalBtnClose = document.querySelector('.modal-btn-close');
      modalBtnClose.addEventListener('click', function(){
        modalEl.classList.remove('show').add('hide');
      }, false);

      // 顯示 Google Map
      initMap(nowData[i].Px, nowData[i].Py, nowData[i].Name);
    }
  }
}

/* --  Google Map -- */
// 初始化 google map
function initMap(px, py, name) {
  let centerXY = {
    lat: parseFloat(py),
    lng: parseFloat(px)
  }

  let map = document.createElement("div");
  map.setAttribute('id', 'map');
  
  let googleMap = document.querySelector('#googleMap');
  googleMap.appendChild(map);

  map = new google.maps.Map(map, {
    zoom: 12,
    center: centerXY
  });

  // 標記座標
  let marker = new google.maps.Marker({
    position: centerXY,
    title: name,
    map: map,
  });
}

// 請求資料
requestData();

// 選擇行政區監聽
var administrativeSelect = document.querySelector('.administrative-select');
administrativeSelect.addEventListener('change', selectChange, false);

// 熱門行政區監聽
var administrativeHot = document.querySelector('.administrative-hot-btnsGroup');
administrativeHot.addEventListener('click', hotChose, false);

// 頁面切換監聽
var pagination = document.querySelector('.pagination');
pagination.addEventListener('click', pageChange, false);

// 下拉捲軸返回頂端監聽
var btnGoTop = document.querySelector('.btn-goTop');
btnGoTop.addEventListener('click', goTop, false);

// 瀏覽器上一頁與下一頁切換監聽
window.addEventListener('popstate', function (e) {
  renderContent(e.state.type, e.state.page, 'isHistoryPopstate');
}, false);

// 