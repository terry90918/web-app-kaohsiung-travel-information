// 請求網址
var urlForAjax = 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97';
// var urlForAjax = '/script/data.json';
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

// 請求資料
function requestData() {
  var xhr = new XMLHttpRequest();
  xhr.open('get', urlForAjax, true);
  xhr.send(null);
  xhr.onload = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var openData = JSON.parse(xhr.responseText);
        records = openData.result.records;
        // 分析網址參數, 帶入渲染函示
        var urlParamsObj = (urlParams() ? urlParams() : {type: '', page: ''});
        renderContent(urlParamsObj.type, urlParamsObj.page);
      } else {
        console.log("資料錯誤!");
      }
    }
  }
}

// 渲染內容
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
  renderSelect();
  renderModel();
  renderPage();
  if (!isHistoryPopstate) {
    historyUpdata();
  }
}

// 渲染下拉選單
function renderSelect() {
  var notRepeating = [];
  var el = document.querySelector('.administrative-select');
  var option = '<option value="" selected disabled hidden>- - 請選擇行政區 - -</option>';

  console.log()
  for (var i = 0; i < records.length; i++) {
    // 1.過濾重複的行政區
    if (notRepeating.indexOf(records[i].Zone) == -1) {
      // 2.整理成陣列
      notRepeating.push(records[i].Zone);
    }
  }

  // 將整理好的陣列渲染到 DOM 上
  for (var i = 0; i < notRepeating.length; i++) {
    option += `<option value="${notRepeating[i]}">${notRepeating[i]}</option>`;
  }
  el.innerHTML = option;
}

// 渲染模組
function renderModel() {
  var start, end;

  if (page == 1) {
    start = 0;
    end = (len > 6 ? 6 : len);
  } else {
    start = (page * 6) - 6;
    end = (len < page * 6 ? len : page * 6);
  }

  var el = document.querySelector('.administrative-cards');
  var cardModel = ``;
  for (var i = start; i < end; i++) {
    cardModel +=
    `<div class="model-card">
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
}

// 渲染分頁碼
function renderPage() {
  var pageLen = Math.floor(nowData.length % 6) === 0 
    ? (nowData.length / 6) : (Math.floor(nowData.length / 6) === 0 
      ? 1 :  (Math.floor(nowData.length / 6) + 1));
  
  var pagination = document.querySelector('.pagination');
  var str = ``;
  page = parseInt(page);
  if (page == 1) {
    str += `<li class="disable">Prev</li>`;
  } else {
    str += `<li>Prev</li>`;
  }
  if (page >= 4) { 
    str += `<li>1</li><li class="disable">...</li>`;
  }

  var start;
  var end;
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

  for (var i = start; i <= end; i ++) {
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
  var selectVal = e.target.value;
  var el = document.querySelector('.administrative-title');
  renderContent(selectVal, 1);
}

// 點擊熱門行政區 
function hotChose(e) {
  if (e.target.nodeName !== 'BUTTON') { return; }
  var hotVal = e.target.textContent;
  renderContent(hotVal, 1);
}

// 頁面切換
function pageChange(e) {
  if (e.target.nodeName !== 'LI') { return; }
  if (e.target.className === 'disable') { return; }

  var textContent = e.target.textContent;
  var goPage;
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
  var urlSearch = window.location.search;
  if (urlSearch) {
    var theRequest = new Object();
    if (urlSearch.indexOf('?') !== -1) {
      var param = urlSearch.split('?')[1];
      if (param.indexOf('&') !== -1) {
        var params = param.split("&");
        for (var i = 0; i < params.length; i++) {
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
  var typeEncodeURI = encodeURI(type);
  var state = { 'type':  typeEncodeURI, 'page': page };
  var title = 'null';
  var url = '?type=' + state.type + '&page=' + state.page;
  history.pushState(state, title, url);
}

// 更新選擇區域資料
function upNowData(goType) {
  var el = document.querySelector('.administrative-title');
  typeData = [];

  el.textContent = goType;
  for (var i = 0; i < records.length; i++) {
    if (records[i].Zone == goType) {
      typeData.push(records[i]);
    }
  }
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

// 上下頁切換監聽
window.addEventListener('popstate', function(e) {
  renderContent(e.state.type, e.state.page, 'isHistoryPopstate');
}, false);