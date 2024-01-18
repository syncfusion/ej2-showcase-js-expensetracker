/**
 * Dashboard handler
 */
var dashboardFunction = require("../dashboard/dashboard.js");
var incomeRadio;
var expenseRadio;
var cashRadio;
var creditRadio;
var debitRadio;
var datepicker;
var timepicker;
var amount;
var paymentmode;
var subCategory;
var income;
var cash;
var creditcard;
var debitcard;
var expense;
var addExpenseDialog;
var editExpenseDialog;
var confirmDialogObj;
var tooltipEdit;
var tooltipDelete;
var tooltipHover;
var multiSelectFilter;
var filterMinAmount;
var filterMaxAmount;

var filterCategory = [];
var numMinValue;
var numMaxValue;
/* tslint:disable */
var editRowData;
var minAmount;
var maxAmount;
var editValue;
var deleteValue;

var dataValue = require("../common/common.data.js");

var categoryExpenseData = dataValue.categoryExpenseData;
var categoryIncomeData = dataValue.categoryIncomeData;

/* tslint:enable */
var defaultGrigColumns = [
    { type: 'checkbox', width: 40, },
    {
        field: 'Category',
        headerText: 'Category',
        template: '#template',
        width: 178,
        editType: 'dropdownedit',
        validationRules: { required: true },
        clipMode: 'ellipsiswithtooltip'
    }, {
        field: 'DateTime',
        headerText: 'Date',
        format: 'yMd',
        width: 112,
        editType: 'datepickeredit',
        validationRules: { required: true },
        hideAtMedia: '(min-width: 1050px)'
    },
    {
        field: 'PaymentMode',
        headerText: 'Payment Mode',
        width: 140,
        editType: 'dropdownedit',
        validationRules: { required: true },
        hideAtMedia: '(min-width: 600px)'
    },
    {
        field: 'Description',
        headerText: 'Description',
        clipMode: 'ellipsis',
        validationRules: { required: true },
        hideAtMedia: '(min-width: 1050px)'
    },
    {
        field: 'UniqueId',
        headerText: 'Unique Id',
        isPrimaryKey: true,
        visible: false
    },
    {
        field: 'Amount',
        headerText: 'Amount',
        editType: 'numericedit',
        width: 120,
        format: 'C0',
        template: '#amtTemplate',
        validationRules: { required: true },
        textAlign: 'right'
    }
];

function onGridRender() {
    if (grid) {
        var editElement = document.getElementById('grid_edit');
        var deleteElement = document.getElementById('grid_delete');
        if (editElement) {
            grid.toolbarModule.toolbar.enableItems(editElement.parentElement, false);
            editElement.parentElement.title = ' ';
        }
        if (deleteElement) {
            grid.toolbarModule.toolbar.enableItems(deleteElement.parentElement, false);
            deleteElement.parentElement.title = ' ';
        }
        editValue = 0;
        deleteValue = 0;
    }
}

function onGridCheckBoxChange(args) {
    if (grid.getSelectedRowIndexes().length > 1) {
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, false);
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, true);
        editValue = 2;
        deleteValue = 2;

    } else if (grid.getSelectedRowIndexes().length === 0) {
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, false);
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, false);
        editValue = 0;
        deleteValue = 0;
    } else if (grid.getSelectedRowIndexes().length === 1) {
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, true);
        grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, true);
        editValue = 1;
        deleteValue = 1;
    }
}
// tslint:disable-next-line:max-func-body-length

window.expense = function () {
    dashboardFunction.cardUpdate();
    var predicateSt = new ej.data.Predicate('Spent', 'equal', 10);
    var predicateStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', window.startDate);
    var predicateEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', window.endDate);
    var predicate = predicateStart.and(predicateEnd);
    var query = new ej.data.Query().where(predicate).select(['Category', 'Budget', 'DateTime', 'Items', 'PaymentMode', 'Spent']).take(5);
    minMaxAmount(window.startDate, window.endDate);

    var defaultSidebar = new ej.navigations.Sidebar({
        width: '270px',
        mediaQuery: window.matchMedia('(min-width: 768px)')
    });
    defaultSidebar.appendTo('#sidebar-indexexpense');
    document.getElementsByClassName('sidebar-wrapper-filter')[0].addEventListener('scroll', document.onscroll);
    defaultSidebar.position = 'Right';

    function minMaxAmount(start, end) {
        var predicateStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', start);
        var predicateEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', end);
        minAmount = new ej.data.DataManager(window.expenseDS).executeLocal((new ej.data.Query()
            .where((predicateStart.and(predicateEnd))))
            .requiresCount().aggregate('min', 'Amount'));
        maxAmount = new ej.data.DataManager(window.expenseDS).executeLocal((new ej.data.Query()
            .where((predicateStart.and(predicateEnd))))
            .requiresCount().aggregate('max', 'Amount'));
        numMinValue = minAmount.aggregates['Amount - min'];
        numMaxValue = maxAmount.aggregates['Amount - max'];
    }
    /* tslint:disable */
    function onGridEditBegin(e) {
        if (e.requestType == 'beginEdit') {
            editRowData = e;
            e.cancel = true;
        }
    }
    /* tslint:enable */
    var rowDiv;
    var incomeElem;
    var expenseElem;
    var gridColumns = defaultGrigColumns;

    grid = new ej.grids.Grid({
        dataSource: window.expenseDS,
        height: '100%',
        width: '100%',
        allowSelection: true,
        rowSelected: onGridCheckBoxChange,
        rowDeselected: onGridCheckBoxChange,
        dataBound: onGridRender,
        editSettings: { allowEditing: true },
        allowPaging: true,
        pageSettings: { pageSize: 11 },
        query: new ej.data.Query().where(predicate).sortByDesc('DateTime'),
        cellSave: onGridSave,
        allowTextWrap: false,
        toolbar: ['Edit', 'Delete'],
        actionBegin: onGridEditBegin,
        columns: gridColumns,
        actionComplete: onGridActionComplete
    });
    grid.appendTo('#grid');
    if (document.getElementById('grid_edit')) {
        document.getElementById('grid_edit').onclick = function () {
            var ajax = new ej.base.Ajax('dialog.html', 'GET', true);
            ajax.send().then();
            ajax.onSuccess = function (data) {
                grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_delete').parentElement, true);
                if (editExpenseDialog) {
                    editExpenseDialog.show();
                } else {
                    editExpenseDialog = new ej.popups.Dialog({
                        header: 'Edit Transaction',
                        content: data,
                        visible: false,
                        showCloseIcon: true,
                        closeOnEscape: false,
                        isModal: true,
                        target: document.body,
                        buttons: [{
                            click: onSaveTransaction, buttonModel: { content: 'Save', cssClass: 'e-info e-save', isPrimary: true }
                        }, { click: onNewDialogCancel, buttonModel: { cssClass: 'e-outline e-cancel', content: 'Cancel' } }],
                        width: '100%',
                        height: '85%',
                        animationSettings: { effect: 'None' },
                        open: onEditDialogOpen,
                        close: onEditDialogClose,
                        overlayClick: dlgOverlayClicked
                    });
                    editExpenseDialog.appendTo('#dialog');
                    editExpenseDialog.show();
                }
            };
        };
    }
    if (document.getElementById('grid_delete')) {
        document.getElementById('grid_delete').onclick = function () {
            confirmDialogObj = new ej.popups.Dialog({
                header: 'Delete',
                visible: false,
                width: '40%',
                isModal: true,
                content: '<span>Are you sure you want to delete the selected transaction(s)?</span>',
                showCloseIcon: true, closeOnEscape: false,
                buttons: [{
                    click: confirmDlgYesBtnClick,
                    buttonModel: { content: 'Yes', cssClass: 'e-ok e-flat', isPrimary: true }
                },
                { click: confirmDlgNoBtnClick, buttonModel: { cssClass: 'e-flat e-no', content: 'No' } }],
                target: document.body,
                animationSettings: { effect: 'None' },
                open: alertDialogOpen, close: dialogClose,
                overlayClick: dlgOverlayClicked
            });
            confirmDialogObj.appendTo('#confirmDialog');
            confirmDialogObj.show();
        };
    }
    function dialogClose() {
        confirmDialogObj.destroy();
        confirmDialogObj = null;
    }
    function confirmDlgNoBtnClick() {
        confirmDialogObj.hide();
    }
    function confirmDlgYesBtnClick() {
        var selectedRecords = grid.getSelectedRecords();
        for (var i = 0; i < selectedRecords.length; i++) {
            new ej.data.DataManager(window.expenseDS).remove('UniqueId', selectedRecords[i]);
        }
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new ej.data.Query().where(predicate).sortByDesc('DateTime')
        });
        grid.refresh();
        dashboardFunction.cardUpdate();
        confirmDialogObj.hide();
    }

    var searchKey = document.getElementById('txt');
    ej.inputs.Input.createInput({
        element: searchKey,
        properties: {
            showClearButton: true
        }
    });
    document.getElementById('searchbtn').onclick = function () {
        grid.search(searchKey.value);
    };

    /** Performs search operation when press Enter key */
    searchKey.onkeyup = function (e) {
        if (e.keyCode === 13) { grid.search(searchKey.value); }
    };

    searchKey.onblur = function () {
        grid.search(searchKey.value);
    };
    (document.getElementsByClassName('e-clear-icon')[0]).onmousedown = function () {
        searchKey.value = '';
    };
    // Initializing the add expense button
    var button = new ej.buttons.Button({});
    button.appendTo('#addexpense');
    function onCheckBoxChange() {
        generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, '');
    }

    document.getElementById('add-btn').onclick = function () {
        showAddDialog();
    };

    document.getElementById('addexpense').onclick = function () {
        showAddDialog();
    };

    /** Disables edit toolbar item in the Expense Grid on the initial load */
    /* tslint:disable */
    function onGridActionComplete(e) {
        setTimeout(function () {
            grid.toolbarModule.toolbar.enableItems(document.getElementById('grid_edit').parentElement, false);
        }, 0);
    }
    /* tslint:enable */

    function showAddDialog() {
        var ajax = new ej.base.Ajax('dialog.html', 'GET', true);
        ajax.send().then();
        ajax.onSuccess = function (data) {
            if (addExpenseDialog) {
                addExpenseDialog.show();
            } else {
                addExpenseDialog = new ej.popups.Dialog({
                    header: 'New Transaction',
                    content: data,
                    visible: false,
                    showCloseIcon: true,
                    closeOnEscape: false,
                    isModal: true,
                    target: document.body,
                    buttons: [{
                        click: addNewTransaction, buttonModel: { content: 'Add', cssClass: 'e-info e-add', isPrimary: true }
                    },
                    {
                        click: onNewDialogCancel, buttonModel: { cssClass: 'e-outline e-cancel', content: 'Cancel' }
                    }
                    ],
                    width: '100%',
                    height: '85%',
                    animationSettings: { effect: 'None' },
                    open: onNewDialogOpen,
                    close: onNewDialogClose,
                    overlayClick: dlgOverlayClicked
                });
                addExpenseDialog.appendTo('#addexpenseDialog');
                addExpenseDialog.show();
            }
        };
    }

    function dlgOverlayClicked() {
        if (addExpenseDialog) {
            addExpenseDialog.hide();
        }
        if (confirmDialogObj) {
            confirmDialogObj.hide();
        }
        if (editExpenseDialog) {
            editExpenseDialog.hide();
        }
    }

    /* tslint:disable-next-line */
    function onSaveTransaction(args) {
        var newExpense = {
            'UniqueId': editRowData.rowData.UniqueId,
            'DateTime': new Date(datepicker.value.setHours(timepicker.value.getHours())),
            'Category': category.value,
            'PaymentMode': (cashRadio.checked && cashRadio.label) ||
                (creditRadio.checked && creditRadio.label) || (debitRadio.checked && debitRadio.label),
            'TransactionType': (incomeRadio.checked && incomeRadio.label) || (expenseRadio.checked && expenseRadio.label),
            'Description': (document.getElementById('description')).value,
            'Amount': '' + amount.value
        };
        new ej.data.DataManager(window.expenseDS).update('UniqueId', newExpense);
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new ej.data.Query().where(predicate).sortByDesc('DateTime')
        });
        grid.refresh();
        dashboardFunction.cardUpdate();
        editExpenseDialog.hide();
    }

    function addNewTransaction() {
        var newExpense = {
            'UniqueId': 'T' + ('' + (+new Date())).substring(5, 10),
            'Category': category.value,
            'Description': (document.getElementById('description')).value,
            'DateTime': new Date(datepicker.value.setHours(timepicker.value.getHours())),
            'PaymentMode': (cashRadio.checked && cashRadio.label) ||
                (creditRadio.checked && creditRadio.label) || (debitRadio.checked && debitRadio.label),
            'TransactionType': (incomeRadio.checked && incomeRadio.label) || (expenseRadio.checked && expenseRadio.label),
            'Amount': '' + amount.value
        };
        new ej.data.DataManager(window.expenseDS).insert(newExpense);
        new ej.data.DataManager(window.expenseDS).update('UniqueId', {
            UniqueId: newExpense.UniqueId,
            'DateTime': (datepicker.value),
            'Category': newExpense.Category,
            'PaymentMode': (cashRadio.checked && cashRadio.label) ||
                (creditRadio.checked && creditRadio.label) || (debitRadio.checked && debitRadio.label),
            'TransactionType': newExpense.TransactionType,
            'Description': newExpense.Description,
            'Amount': '' + newExpense.Amount
        });
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new ej.data.Query().where(predicate).sortByDesc('DateTime')

        });
        grid.refresh();
        addExpenseDialog.hide();
        dashboardFunction.cardUpdate();
    }

    function onNewDialogCancel() {
        (document.querySelector('.e-dlg-closeicon-btn')).click();
    }
    function onNewDialogClose() {
        this.dlgContainer.style.zIndex = '100';
        addExpenseDialog.destroy();
        addExpenseDialog = null;
    }

    function onChange(args) {
        if (this.element.value === 'Income') {
            category.dataSource = categoryIncomeData;
        } else {
            category.dataSource = categoryExpenseData;
        }
    }

    function createDialogComponent() {
        incomeRadio = new ej.buttons.RadioButton({ value: 'Income', label: 'Income', name: 'dlgTransactionType', change: onChange });
        incomeRadio.appendTo('#incomeradio');
        expenseRadio = new ej.buttons.RadioButton({ value: 'Expense', label: 'Expense', name: 'dlgTransactionType', checked: true, change: onChange });
        expenseRadio.appendTo('#expenseradio');
        datepicker = new ej.calendars.DatePicker({
            placeholder: 'Choose a Date', width: '100%', value: window.endDate,
            floatLabelType: 'Always'
        });
        datepicker.appendTo('#datepicker');
        timepicker = new ej.calendars.TimePicker({
            placeholder: 'Choose a Time', width: '100%', floatLabelType: 'Always', value: new Date()
        });
        timepicker.appendTo('#timepicker');
        category = new ej.dropdowns.DropDownList({
            placeholder: 'Select a Category',
            cssClass: 'Category',
            floatLabelType: 'Always',
            dataSource: categoryExpenseData,
            fields: { text: 'Category', iconCss: 'Class', value: 'Category' },
        });
        category.appendTo('#category');
        creditRadio = new ej.buttons.RadioButton({ value: 'Credit Card', label: 'Credit Card', name: 'dlgPaymentMode' });
        creditRadio.appendTo('#creditradio');
        debitRadio = new ej.buttons.RadioButton({ value: 'Debit Card', label: 'Debit Card', name: 'dlgPaymentMode' });
        debitRadio.appendTo('#debitradio');
        cashRadio = new ej.buttons.RadioButton({ value: 'Cash', label: 'Cash', checked: true, name: 'dlgPaymentMode' });
        cashRadio.appendTo('#cashradio');
        amount = new ej.inputs.NumericTextBox({
            placeholder: 'Enter a Amount',
            floatLabelType: 'Always',
            format: 'c2',
            min: 0
        });
        amount.appendTo('#amount');
    }
    function alertDialogOpen() {
        this.dlgContainer.style.zIndex = '1000000';
    }
    function onEditDialogClose() {
        document.body.style.overflowY = 'auto';
        editExpenseDialog.destroy();
        editExpenseDialog = null;
    }
    function onEditDialogOpen() {
        this.dlgContainer.style.zIndex = '1000000';
        document.body.style.overflowY = 'hidden';
        createDialogComponent();
        if (editRowData.rowData.TransactionType === 'Income') {
            incomeRadio.checked = true;
            category.dataSource = categoryIncomeData;
        }
        if (editRowData.rowData.TransactionType === 'expense') {
            expenseRadio.checked = true;
            category.dataSource = categoryExpenseData;
        }
        datepicker.value = editRowData.rowData.DateTime;
        timepicker.value = editRowData.rowData.DateTime;
        if (editRowData.rowData.PaymentMode === 'Credit Card') {
            creditRadio.checked = true;
        } else if (editRowData.rowData.PaymentMode === 'Debit Card') {
            debitRadio.checked = true;
        } else if (editRowData.rowData.PaymentMode === 'Cash') {
            cashRadio.checked = true;
        }
        (document.getElementById('description')).value = editRowData.rowData.Description;
        category.value = editRowData.rowData.Category;
        amount.value = editRowData.rowData.Amount;

    }
    function onNewDialogOpen() {
        this.dlgContainer.style.zIndex = '1000000';
        createDialogComponent();
    }
    function generatePredicate(start, end, updater) {
        var predicates;
        var predicatesStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', start);
        var predicatesEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', end);
        predicates = predicatesStart.and(predicatesEnd);
        var predIncome;
        var predExpense;
        var predCash;
        var predDebit;
        var preCredit;
        var preCategory;
        var preCategorys;
        minMaxAmount(dateRangePickerObject.startDate, dateRangePickerObject.endDate);
        if (updater === 'dateChange') {
            if (!ej.base.isNullOrUndefined(numMinValue) && !ej.base.isNullOrUndefined(numMaxValue)) {
                rangeObj.setProperties({
                    min: numMinValue,
                    max: numMaxValue,
                    value: [numMinValue, numMaxValue]
                });
            }
        }
        /* tslint:disable */
        var val = [rangeObj.value[0], rangeObj.value[1]];
        /* tslint:enable */
        var predMinAmt = new ej.data.Predicate('Amount', 'greaterthanorequal', val[0]);
        var predMaxAmt = new ej.data.Predicate('Amount', 'lessthanorequal', val[1]);
        predicates = predicates.and(predMinAmt).and(predMaxAmt);
        if (income.checked || expenses.checked) {
            if (income.checked) {
                predIncome = new ej.data.Predicate('TransactionType', 'equal', 'Income');
            }
            if (expenses.checked) {
                predExpense = new ej.data.Predicate('TransactionType', 'equal', 'Expense');
            }
            if (expenses.checked && income.checked) {
                predIncome = predIncome.or(predExpense);
                predicates = predicates.and(predIncome);
            } else if (income.checked) {
                predicates = predicates.and(predIncome);
            } else if (expenses.checked) {
                predicates = predicates.and(predExpense);
            }
        }
        if (cash.checked || debitcard.checked || creditcard.checked) {
            if (cash.checked) {
                predCash = new ej.data.Predicate('PaymentMode', 'equal', 'Cash');
            }
            if (creditcard.checked) {
                preCredit = new ej.data.Predicate('PaymentMode', 'equal', 'Credit Card');
            }
            if (debitcard.checked) {
                predDebit = new ej.data.Predicate('PaymentMode', 'equal', 'Debit Card');
            }
            if (cash.checked && creditcard.checked && debitcard.checked) {
                predIncome = preCredit.or(predDebit).or(predCash);
                predicates = predicates.and(predIncome);
            } else if (cash.checked && creditcard.checked) {
                predIncome = predCash.or(preCredit);
                predicates = predicates.and(predIncome);
            } else if (cash.checked && debitcard.checked) {
                predIncome = predCash.or(predDebit);
                predicates = predicates.and(predIncome);
            } else if (creditcard.checked && debitcard.checked) {
                predIncome = preCredit.or(predDebit);
                predicates = predicates.and(predIncome);
            } else if (cash.checked) {
                predicates = predicates.and(predCash);
            } else if (debitcard.checked) {
                predicates = predicates.and(predDebit);
            } else if (creditcard.checked) {
                predicates = predicates.and(preCredit);
            }
        }
        if (!ej.base.isNullOrUndefined(multiSelectFilter.value) && multiSelectFilter.value.length > 0) {
            var list = multiSelectFilter.value;
            for (var i = 0; i < list.length; i++) {
                preCategory = new ej.data.Predicate('Category', 'equal', list[i]);
                if (i === 0) {
                    preCategorys = preCategory;
                } else {
                    preCategorys = preCategorys.or(preCategory);
                }
            }
            predicates = predicates.and(preCategorys);
        }
        grid.setProperties({
            dataSource: window.expenseDS,
            query: new ej.data.Query().where(predicates).sortByDesc('DateTime')

        });
        grid.refresh();
        getCategory(dateRangePickerObject.startDate, dateRangePickerObject.endDate);
        multiSelectFilter.dataSource = filterCategory;
        multiSelectFilter.dataBind();
    }
    function amountChanged() {
        generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, '');
    }
    function dateRangeChanged(args) {
        window.startDate = args.startDate;
        window.endDate = args.endDate;
        dashboardFunction.cardUpdate(true);
        generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, 'dateChange');
    }
    dateRangePickerObject = new ej.calendars.DateRangePicker({
        startDate: window.startDate,
        endDate: window.endDate,
        cssClass: 'DateTime',
        format: 'MM/dd/yyyy',
        showClearButton: false,
        allowEdit: false,
        change: dateRangeChanged
    });
    dateRangePickerObject.appendTo('#daterange');
    getCategory(dateRangePickerObject.startDate, dateRangePickerObject.endDate);
    multiSelectFilter = new ej.dropdowns.MultiSelect({
        dataSource: filterCategory,
        placeholder: 'Select Categories',
        mode: 'Box',
        hideSelectedItem: true,
        closePopupOnSelect: false,
        select: categoryUpdated,
        removed: categoryUpdated
    });
    multiSelectFilter.appendTo('#expense-category');
    var searchEle = document.getElementsByClassName('e-searcher')[0];
    searchEle.querySelector('input').setAttribute('readonly', 'true');
    rangeObj = new ej.inputs.Slider({
        type: 'Range',
        cssClass: 'inlineAlign',
        showButtons: true,
        tooltip: { placement: 'Before', isVisible: true, showOn: 'Focus' },
        min: numMinValue,
        max: numMaxValue,
        value: [numMinValue, numMaxValue],
        change: amountChanged,
    });
    rangeObj.appendTo('#range');

    income = new ej.buttons.CheckBox({ label: 'Income', checked: true, cssClass: 'TransactionType', change: onCheckBoxChange });
    income.appendTo('#income');
    expenses = new ej.buttons.CheckBox({ label: 'Expense', checked: true, cssClass: 'TransactionType', change: onCheckBoxChange });
    expenses.appendTo('#expenses');
    cash = new ej.buttons.CheckBox({ label: 'Cash', checked: true, cssClass: 'PaymentMode', change: onCheckBoxChange });
    cash.appendTo('#cash');
    creditcard = new ej.buttons.CheckBox({ label: 'Credit Card', checked: true, cssClass: 'PaymentMode', change: onCheckBoxChange });
    creditcard.appendTo('#creditcard');
    debitcard = new ej.buttons.CheckBox({ label: 'Debit Card', checked: true, cssClass: 'PaymentMode', change: onCheckBoxChange });
    debitcard.appendTo('#debitcard');
    /* tslint:disable-next-line */
    function onGridSave(args) {
        new ej.data.DataManager(window.expenseDS).update('UniqueId', args.rowData);
    }

    function categoryUpdated() {
        setTimeout(function () {
            generatePredicate(dateRangePickerObject.startDate, dateRangePickerObject.endDate, '');
            /* tslint:disable-next-line */
        }, 10);
    }

    document.getElementById('filterExpense').onclick = function () {
        toggleFilterMenu();
    };
};

function getCategory(start, end) {
    filterCategory = [];
    /* tslint:disable-next-line */
    var tempData = require("../common/common.data.js")
    tempData.expenseData.forEach(function (item) {
        /* tslint:enable-next-line */
        if (start.valueOf() <= item.DateTime.valueOf() && end.valueOf() >= item.DateTime.valueOf()) {
            if (filterCategory.indexOf(item.Category) < 0) {
                filterCategory.push(item.Category);
            }
        }
    });
}