const store = require('../../utils/store');

const emptyForm = { id: '', date: '', orderNo: '', logisticsCompany: '', trackingNo: '', name: '', spec: '', quantity: '', status: '', remark: '' };

Page({
  data: {
    form: { ...emptyForm },
    filterDate: '',
    records: [],
    inventoryOptions: [],
    inventoryLabels: [],
    inventoryIndex: 0,
    selectedInventoryLabel: '',
    selectedMap: {},
    allSelected: false
  },
  onShow() {
    if (wx.getStorageSync('sfds_authed') !== true) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.loadData();
  },
  loadData() {
    const options = store.getInventoryOptions();
    const records = store.read('returns').filter((item) => !this.data.filterDate || item.date === this.data.filterDate);
    this.setData({ records, inventoryOptions: options, inventoryLabels: options.map((item) => item.label) });
  },
  onInput(event) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
  },
  onDateChange(event) {
    this.setData({ 'form.date': event.detail.value });
  },
  onInventoryPick(event) {
    const index = Number(event.detail.value);
    const item = this.data.inventoryOptions[index];
    if (item) {
      this.setData({ inventoryIndex: index, selectedInventoryLabel: item.label, 'form.name': item.name, 'form.spec': item.spec });
    }
  },
  save() {
    const form = this.data.form;
    if (!form.date || !form.orderNo || !form.name || !form.spec) {
      wx.showToast({ title: '请补全退货日期、订单和商品信息', icon: 'none' });
      return;
    }
    store.upsertRecord('returns', { ...form, quantity: store.toNumber(form.quantity) });
    wx.showToast({ title: '已保存', icon: 'success' });
    this.resetForm();
    this.loadData();
  },
  edit(event) {
    const item = store.read('returns').find((record) => record.id === event.currentTarget.dataset.id);
    if (item) {
      this.setData({ form: { ...item }, selectedInventoryLabel: `${item.name}｜${item.spec}` });
    }
  },
  resetForm() {
    this.setData({ form: { ...emptyForm }, selectedInventoryLabel: '', inventoryIndex: 0 });
  },
  onFilterDate(event) {
    this.setData({ filterDate: event.detail.value }, () => this.loadData());
  },
  clearFilter() {
    this.setData({ filterDate: '' }, () => this.loadData());
  },
  toggleSelect(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`selectedMap.${id}`]: !this.data.selectedMap[id] });
  },
  toggleSelectAll() {
    const next = !this.data.allSelected;
    const selectedMap = {};
    this.data.records.forEach((item) => {
      selectedMap[item.id] = next;
    });
    this.setData({ selectedMap, allSelected: next });
  }
});
