const store = require('../../utils/store');

const emptyForm = { id: '', date: '', name: '', spec: '', quantity: '', price: '', total: '', remark: '' };
const emptyCostForm = { id: '', date: '', amount: '', purpose: '', category: '', remark: '' };

Page({
  data: {
    form: { ...emptyForm },
    costForm: { ...emptyCostForm },
    costCategories: store.COST_CATEGORIES,
    costCategoryIndex: 0,
    filterDate: '',
    records: [],
    costs: [],
    inventoryOptions: [],
    inventoryLabels: [],
    inventoryIndex: 0,
    selectedInventoryLabel: '',
    selectedMap: {},
    selectedCostMap: {},
    allSelected: false,
    allCostSelected: false
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
    const records = store.read('outbound')
      .filter((item) => !this.data.filterDate || item.date === this.data.filterDate)
      .map((item) => ({ ...item, price: store.money(item.price), total: store.money(item.total || store.toNumber(item.price) * store.toNumber(item.quantity)) }));
    const costs = store.read('costs').map((item) => ({ ...item, amount: store.money(item.amount) }));
    this.setData({ records, costs, inventoryOptions: options, inventoryLabels: options.map((item) => item.label) });
  },
  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value }, () => {
      if (field === 'quantity' || field === 'price') {
        this.setData({ 'form.total': store.money(store.toNumber(this.data.form.quantity) * store.toNumber(this.data.form.price)) });
      }
    });
  },
  onDateChange(event) {
    this.setData({ 'form.date': event.detail.value });
  },
  onInventoryPick(event) {
    const index = Number(event.detail.value);
    const item = this.data.inventoryOptions[index];
    if (item) {
      this.setData({ inventoryIndex: index, selectedInventoryLabel: item.label, 'form.name': item.name, 'form.spec': item.spec, 'form.price': item.price, 'form.total': store.money(store.toNumber(this.data.form.quantity) * store.toNumber(item.price)) });
    }
  },
  save() {
    const form = this.data.form;
    if (!form.date || !form.name || !form.spec) {
      wx.showToast({ title: '请补全出库日期和商品信息', icon: 'none' });
      return;
    }
    store.upsertRecord('outbound', { ...form, price: store.toNumber(form.price), quantity: store.toNumber(form.quantity), total: store.toNumber(form.total) });
    wx.showToast({ title: '已保存', icon: 'success' });
    this.resetForm();
    this.loadData();
  },
  edit(event) {
    const item = store.read('outbound').find((record) => record.id === event.currentTarget.dataset.id);
    if (item) {
      this.setData({ form: { ...item }, selectedInventoryLabel: `${item.name}｜${item.spec}｜¥${store.money(item.price)}` });
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
  },
  onCostInput(event) {
    this.setData({ [`costForm.${event.currentTarget.dataset.field}`]: event.detail.value });
  },
  onCostDateChange(event) {
    this.setData({ 'costForm.date': event.detail.value });
  },
  onCostCategoryChange(event) {
    const index = Number(event.detail.value);
    this.setData({ costCategoryIndex: index, 'costForm.category': this.data.costCategories[index] });
  },
  saveCost() {
    const form = this.data.costForm;
    if (!form.date || !form.amount || !form.purpose || !form.category) {
      wx.showToast({ title: '请补全成本登记信息', icon: 'none' });
      return;
    }
    store.upsertRecord('costs', { ...form, amount: store.toNumber(form.amount) });
    wx.showToast({ title: '已保存', icon: 'success' });
    this.resetCostForm();
    this.loadData();
  },
  editCost(event) {
    const item = store.read('costs').find((record) => record.id === event.currentTarget.dataset.id);
    if (item) {
      this.setData({ costForm: { ...item }, costCategoryIndex: Math.max(0, this.data.costCategories.indexOf(item.category)) });
    }
  },
  resetCostForm() {
    this.setData({ costForm: { ...emptyCostForm }, costCategoryIndex: 0 });
  },
  toggleCostSelect(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`selectedCostMap.${id}`]: !this.data.selectedCostMap[id] });
  },
  toggleCostSelectAll() {
    const next = !this.data.allCostSelected;
    const selectedCostMap = {};
    this.data.costs.forEach((item) => {
      selectedCostMap[item.id] = next;
    });
    this.setData({ selectedCostMap, allCostSelected: next });
  }
});
