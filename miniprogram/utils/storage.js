// 历史记录管理
const MAX_HISTORY = 50;
const HISTORY_KEY = 'scan_history';

function getHistory() {
  return wx.getStorageSync(HISTORY_KEY) || [];
}

function addHistory(record) {
  // record: { barcode, name, brand, score, scoreLabel, source, ingredients, analysisResult, timestamp }
  const history = getHistory();
  const newRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: Date.now()
  };
  history.unshift(newRecord);
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  wx.setStorageSync(HISTORY_KEY, history);
  return newRecord;
}

function clearHistory() {
  wx.setStorageSync(HISTORY_KEY, []);
}

function getHistoryById(id) {
  const history = getHistory();
  return history.find(h => h.id === id);
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}月${d}日`;
}

module.exports = { getHistory, addHistory, clearHistory, getHistoryById, formatTime };
