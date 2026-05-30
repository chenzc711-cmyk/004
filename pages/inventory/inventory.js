const store = require('../../utils/store');

const emptyForm = { id: '', name: '', spec: '', price: '', quantity: '', supplier: '', remark: '', warningQuantity: '' };
const emptyBalanceForm = { id: '', supplier: '', balance: '', remark: '' };

Page({
  data: {
    supplierOptions: store.SUPPLIER_OPTIONS,
    supplierIndex: 0,
    balanceSupplierIndex: 0,
    form: { ...emptyForm },
    balanceForm: { ...emptyBalanceForm },
    inventory: [],
    supplierBalances: [],
    selectedMap: {},
    selectedBalanceMap: {},
    allSelected: false,
    allBalanceSelected: false
  },
  onShow() {
    if (wx.getStorageSync('sfds_authed') !== true) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.loadData();
  },
  loadData() {
    const inventory = store.read('inventory').map((item) => ({
      ...item,
      price: store.money(item.price),
      amount: store.money(store.toNumber(item.price) * store.toNumber(item.quantity))
    }));
    const supplierBalances = store.read('suppliers').map((item) => ({ ...item, balance: store.money(item.balance) }));
    this.setData({ inventory, supplierBalances });
  },
  onFormInput(event) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
  },
  onSupplierChange(event) {
    const index = Number(event.detail.value);
    this.setData({ supplierIndex: index, 'form.supplier': this.data.supplierOptions[index] });
  },
  saveInventory() {
    const form = this.data.form;
    if (!form.name || !form.spec) {
      wx.showToast({ title: '请填写商品名称和规格', icon: 'none' });
      return;
    }
    store.upsertRecord('inventory', {
      ...form,
      price: store.toNumber(form.price),
      quantity: store.toNumber(form.quantity),
      warningQuantity: store.toNumber(form.warningQuantity)
    });
    wx.showToast({ title: '已保存', icon: 'success' });
    this.resetForm();
    this.loadData();
  },
  editInventory(event) {
    const item = store.read('inventory').find((record) => record.id === event.currentTarget.dataset.id);
    if (item) {
      this.setData({ form: { ...item }, supplierIndex: Math.max(0, this.data.supplierOptions.indexOf(item.supplier)) });
    }
  },
  resetForm() {
    this.setData({ form: { ...emptyForm }, supplierIndex: 0 });
  },
  toggleSelect(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`selectedMap.${id}`]: !this.data.selectedMap[id] });
  },
  toggleSelectAll() {
    const next = !this.data.allSelected;
    const selectedMap = {};
    this.data.inventory.forEach((item) => {
      selectedMap[item.id] = next;
    });
    this.setData({ selectedMap, allSelected: next });
  },
  toggleBalanceSelect(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`selectedBalanceMap.${id}`]: !this.data.selectedBalanceMap[id] });
  },
  toggleBalanceSelectAll() {
    const next = !this.data.allBalanceSelected;
    const selectedBalanceMap = {};
    this.data.supplierBalances.forEach((item) => {
      selectedBalanceMap[item.id] = next;
    });
    this.setData({ selectedBalanceMap, allBalanceSelected: next });
  },
  onBalanceInput(event) {
    this.setData({ [`balanceForm.${event.currentTarget.dataset.field}`]: event.detail.value });
  },
  onBalanceSupplierChange(event) {
    const index = Number(event.detail.value);
    this.setData({ balanceSupplierIndex: index, 'balanceForm.supplier': this.data.supplierOptions[index] });
  },
  saveBalance() {
    const form = this.data.balanceForm;
    if (!form.supplier) {
      wx.showToast({ title: '请选择供应商', icon: 'none' });
      return;
    }
    store.upsertRecord('suppliers', { ...form, balance: store.toNumber(form.balance) });
    wx.showToast({ title: '已保存', icon: 'success' });
    this.resetBalanceForm();
    this.loadData();
  },
  editBalance(event) {
    const item = store.read('suppliers').find((record) => record.id === event.currentTarget.dataset.id);
    if (item) {
      this.setData({ balanceForm: { ...item }, balanceSupplierIndex: Math.max(0, this.data.supplierOptions.indexOf(item.supplier)) });
    }
  },
  resetBalanceForm() {
    this.setData({ balanceForm: { ...emptyBalanceForm }, balanceSupplierIndex: 0 });
  }
});
