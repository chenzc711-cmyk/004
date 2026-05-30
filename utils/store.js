const KEYS = {
  inventory: 'sfds_inventory',
  suppliers: 'sfds_supplier_balances',
  inbound: 'sfds_inbound_records',
  returns: 'sfds_return_records',
  outbound: 'sfds_outbound_records',
  costs: 'sfds_cost_records'
};

const SUPPLIER_OPTIONS = ['普通渠道商', '3W品牌渠道商', '台州伊文渠道商'];
const COST_CATEGORIES = ['代发成本', '采购成本', '人工成本', '其他成本'];

function read(key) {
  return wx.getStorageSync(KEYS[key]) || [];
}

function write(key, data) {
  wx.setStorageSync(KEYS[key], data);
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function money(value) {
  return toNumber(value).toFixed(2);
}

function today() {
  const now = new Date();
  return formatDate(now);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentMonthPrefix() {
  return today().slice(0, 7);
}

function getInventoryOptions() {
  return read('inventory').map((item) => ({
    id: item.id,
    label: `${item.name || '未命名商品'}｜${item.spec || '无规格'}｜¥${money(item.price)}`,
    name: item.name || '',
    spec: item.spec || '',
    price: money(item.price),
    supplier: item.supplier || ''
  }));
}

function upsertRecord(key, record) {
  const list = read(key);
  const payload = {
    ...record,
    updatedAt: Date.now()
  };
  if (payload.id) {
    write(key, list.map((item) => (item.id === payload.id ? payload : item)));
    return payload.id;
  }
  const id = makeId(key);
  write(key, [{ ...payload, id, createdAt: Date.now() }, ...list]);
  return id;
}

function monthRecords(list, dateField) {
  const prefix = currentMonthPrefix();
  return list.filter((item) => String(item[dateField] || '').startsWith(prefix));
}

function calcDashboard() {
  const inventory = read('inventory');
  const inbound = read('inbound');
  const returns = read('returns');
  const outbound = read('outbound');
  const costs = read('costs');
  const suppliers = read('suppliers');
  const todayText = today();

  const inventoryQuantity = inventory.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const inventoryAmount = inventory.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.price), 0);
  const warningCount = inventory.filter((item) => toNumber(item.quantity) <= toNumber(item.warningQuantity)).length;
  const supplierBalance = suppliers.reduce((sum, item) => sum + toNumber(item.balance), 0);
  const consignmentCost = costs
    .filter((item) => item.category === '代发成本')
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  const todayOutbound = outbound.filter((item) => item.date === todayText);
  const todayInbound = inbound.filter((item) => item.date === todayText);
  const monthlyInbound = monthRecords(inbound, 'date');
  const monthlyOutbound = monthRecords(outbound, 'date');

  const sumQuantity = (list) => list.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const sumAmount = (list) => list.reduce((sum, item) => sum + toNumber(item.total || toNumber(item.price) * toNumber(item.quantity)), 0);

  return {
    consignmentCost: money(consignmentCost),
    inventoryQuantity,
    inventoryAmount: money(inventoryAmount),
    warningCount,
    supplierBalance: money(supplierBalance),
    todayOutboundQuantity: sumQuantity(todayOutbound),
    todayOutboundAmount: money(sumAmount(todayOutbound)),
    todayInboundQuantity: sumQuantity(todayInbound),
    todayInboundAmount: money(sumAmount(todayInbound)),
    monthlyInboundQuantity: sumQuantity(monthlyInbound),
    monthlyInboundAmount: money(sumAmount(monthlyInbound)),
    monthlyOutboundQuantity: sumQuantity(monthlyOutbound),
    monthlyOutboundAmount: money(sumAmount(monthlyOutbound)),
    monthlyTotalQuantity: sumQuantity(monthlyInbound) + sumQuantity(monthlyOutbound),
    monthlyTotalAmount: money(sumAmount(monthlyInbound) + sumAmount(monthlyOutbound)),
    returnCount: returns.length
  };
}

module.exports = {
  KEYS,
  SUPPLIER_OPTIONS,
  COST_CATEGORIES,
  read,
  write,
  makeId,
  toNumber,
  money,
  today,
  upsertRecord,
  getInventoryOptions,
  calcDashboard
};
