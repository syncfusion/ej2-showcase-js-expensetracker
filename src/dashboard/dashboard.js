/**
 * Dashboard handler
 */

var predicateStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', window.startDate);
var predicateEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', window.endDate);
var predicate = predicateStart.and(predicateEnd);

var dataValue = require("../common/common.data.js");

var chartDS;
var pieChartDS;
var gridDS;
var linechartObj;
var columnChartObj;
var gridObj;
var pie;
var grid;
var pieLegendData = [];
var pieRenderData = [];
var tempData = dataValue.expenseData;
var dataSource = dataValue.expenseData;
var legendData = [];
var pieRenderingData = [];
var category = [];
var expTotal = 0;
var dateRangePickerObject;
var groupValue = 0;
var renderData = [];
var hiGridData = [];

export function cardUpdate(toUpdate) {
    if (toUpdate) {
        updatePredicate();
    }
    var intl = new ej.base.Internationalization();
    var nFormatter = intl.getNumberFormat({ skeleton: 'C0', currency: 'USD' });
    var incomeRS = 0;
    var expenseRS = 0;
    /* tslint:disable-next-line */
    var incomeD = [];
    /* tslint:disable-next-line */
    var expenseD = [];
    new ej.data.DataManager(window.expenseDS).executeQuery((new ej.data.Query()
        .where((predicateStart.and(predicateEnd)).and('TransactionType', 'equal', 'Income'))))
        /* tslint:disable-next-line */
        .then(function (e) {
            incomeD = objectAssign(e);
            for (var i = 0; i < incomeD.length - 1; i++) {
                incomeRS += parseInt(incomeD[i].Amount, 0);
            }
            if (document.getElementById('tolincome')) {
                document.getElementById('tolincome').textContent = window.getCurrencyVal(incomeRS ? incomeRS : 0);
            }
        });

    new ej.data.DataManager(window.expenseDS)
        .executeQuery(new ej.data.Query().where((predicateStart.and(predicateEnd)).and('TransactionType', 'equal', 'Expense')))
        /* tslint:disable-next-line */
        .then(function (e) {
            expenseD = objectAssign(e);
            for (var i = 0; i < expenseD.length - 1; i++) {
                expenseRS += parseInt(expenseD[i].Amount, 0);
            }
            if (document.getElementById('tolexpense')) {
                document.getElementById('tolexpense').textContent = window.getCurrencyVal(expenseRS ? expenseRS : 0);
            }
            if (document.getElementById('current-balance')) {
                document.getElementById('current-balance').textContent = window.getCurrencyVal(incomeRS - expenseRS);
            }
            if (document.getElementById('tolbalance')) {
                document.getElementById('tolbalance').textContent = window.getCurrencyVal(incomeRS - expenseRS);
            }
        });

    /* tslint:disable-next-line */
    var transaction = new ej.data.DataManager(window.expenseDS)
        .executeLocal((new ej.data.Query().where(predicateStart.and(predicateEnd))));
    if (document.getElementById('toltransaction')) {
        document.getElementById('toltransaction').textContent = window.getNumberVal(transaction.length);
    }
}

/* tslint:disable-next-line */
var columnIncomeDS = [];
/* tslint:disable-next-line */
var columnExpenseDS = [];
/* tslint:disable-next-line */
var lineDS = [];
/* tslint:disable-next-line */
var tempChartIncomeDS = {};
/* tslint:disable-next-line */
var tempChartExpenseDS = {};
/* tslint:disable-next-line */
var tempChartLineDS = {};
/* tslint:disable-next-line */
var curDateTime;
/* tslint:disable-next-line */
var lineD = [];

function updatePredicate() {
    predicateStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', window.startDate);
    predicateEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', window.endDate);
    predicate = predicateStart.and(predicateEnd);
}
function getLineChartDS() {
    lineD = [];
    lineDS = [];
    tempChartLineDS = [];
    tempChartLineDS = columnIncomeDS.concat(columnExpenseDS);
    for (var i = 0; i < tempChartLineDS.length; i++) {
        /* tslint:disable-next-line */
        var cur = tempChartLineDS[i];
        if (cur.DateTime.getMonth() in lineD) {
            curDateTime = lineD[cur.DateTime.getMonth()];
            lineD[cur.DateTime.getMonth()].Amount = Math.abs((parseInt(curDateTime.Amount, 0) - parseInt(cur.Amount, 0)));
        } else {
            lineD[cur.DateTime.getMonth()] = cur;
        }
    }
    /* tslint:disable-next-line */
    for (var data = 0; data <= lineD.length; data++) {
        if (lineD[data]) {
            lineDS.push(lineD[data]);
        }
    }
}
/* tslint:disable-next-line */
function objectAssign(e) {
    var result = [];
    /* tslint:disable-next-line */
    var obj;
    obj = ej.base.extend(obj, e.result, {}, true);
    for (var data = 0; data <= Object.keys(e.result).length; data++) {
        result.push(obj[data]);
    }
    return result;
}
/* tslint:disable-next-line */
function getCoulmnChartExpenseDS(e) {
    columnExpenseDS = [];
    tempChartExpenseDS = [];
    var result = objectAssign(e);
    for (var i = 0; i < result.length - 1; i++) {
        /* tslint:disable-next-line */
        var cur = result[i];
        if (cur.DateTime.getMonth() in tempChartExpenseDS) {
            curDateTime = tempChartExpenseDS[cur.DateTime.getMonth()];
            tempChartExpenseDS[cur.DateTime.getMonth()].Amount = parseInt(curDateTime.Amount, 0) + parseInt(cur.Amount, 0);
        } else {
            tempChartExpenseDS[cur.DateTime.getMonth()] = cur;
            /* tslint:disable-next-line */
            tempChartExpenseDS[cur.DateTime.getMonth()].DateTime = new Date(new Date(tempChartExpenseDS[cur.DateTime.getMonth()].DateTime.setHours(0, 0, 0, 0)).setDate(1));
        }
    }
    /* tslint:disable-next-line */
    for (var data in tempChartExpenseDS) {
        columnExpenseDS.push(tempChartExpenseDS[data]);
    }
}
/* tslint:disable-next-line */
function getCoulmnChartIncomeDS(e) {
    columnIncomeDS = [];
    tempChartIncomeDS = [];
    var result = objectAssign(e);
    for (var i = 0; i < result.length - 1; i++) {
        /* tslint:disable-next-line */
        var cur = result[i];
        if (cur.DateTime.getMonth() in tempChartIncomeDS) {
            curDateTime = tempChartIncomeDS[cur.DateTime.getMonth()];
            tempChartIncomeDS[cur.DateTime.getMonth()].Amount = parseInt(curDateTime.Amount, 0) + parseInt(cur.Amount, 0);
        } else {
            tempChartIncomeDS[cur.DateTime.getMonth()] = cur;
            /* tslint:disable-next-line */
            tempChartIncomeDS[cur.DateTime.getMonth()].DateTime = new Date(new Date(tempChartIncomeDS[cur.DateTime.getMonth()].DateTime.setHours(0, 0, 0, 0)).setDate(1));
        }
    }
    /* tslint:disable-next-line */
    for (var data in tempChartIncomeDS) {
        columnIncomeDS.push(tempChartIncomeDS[data]);
    }
}

// tslint:disable-next-line:max-func-body-length
function onDateRangeChange(args) {
    window.startDate = args.startDate;
    window.endDate = args.endDate;
    lineDS = [];
    lineD = [];
    columnIncomeDS = [];
    columnExpenseDS = [];
    tempChartExpenseDS = [];
    tempChartIncomeDS = [];
    lineD = [];
    predicateStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', args.startDate);
    predicateEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', args.endDate);
    predicate = predicateStart.and(predicateEnd);
    cardUpdate();
    /* tslint:disable */
    new ej.data.DataManager(window.expenseDS)
        .executeQuery(new ej.data.Query().where(predicate.and('TransactionType', 'equal', 'Expense')))
        .then(function (e) {
            getCoulmnChartExpenseDS(e);

        });
    /* tslint:enable */
    /* tslint:disable */
    new ej.data.DataManager(window.expenseDS)
        .executeQuery(new ej.data.Query().where(predicate.and('TransactionType', 'equal', 'Income')))
        .then(function (e) {
            getCoulmnChartIncomeDS(e);
            columnChartObj.setProperties({
                //Initializing Chart Series
                primaryXAxis: {
                    labelFormat: 'MMM',
                    valueType: 'DateTime',
                    edgeLabelPlacement: 'Shift'
                },
                //Initializing Primary Y Axis
                primaryYAxis:
                    {
                        title: 'Amount',
                        labelFormat: 'c0'
                    },
                useGroupingSeparator: true,
                series: [
                    {
                        type: 'Column',
                        dataSource: columnIncomeDS,
                        legendShape: 'Circle',
                        xName: 'DateTime',
                        width: 2,
                        yName: 'Amount',
                        name: 'Income',
                        marker: {
                            visible: true, height: 10, width: 10
                        },
                        fill: '#A16EE5',
                        border: { width: 0.5, color: '#A16EE5' },
                        animation: { enable: false },
                    },
                    {
                        type: 'Column',
                        dataSource: columnExpenseDS,
                        legendShape: 'Circle',
                        xName: 'DateTime',
                        width: 2,
                        yName: 'Amount',
                        name: 'Expense',
                        marker: {
                            visible: true, height: 10, width: 10
                        },
                        fill: '#4472C4',
                        animation: { enable: false },
                    },
                ]
            });
            columnChartObj.refresh();
            lineD = [];
            getLineChartDS();
            linechartObj.setProperties({
                //Initializing Chart Series
                series: [
                    {
                        type: 'Area',
                        dataSource: lineDS,
                        xName: 'DateTime', width: 2, marker: {
                            visible: true,
                            width: 10,
                            height: 10,
                            fill: 'white',
                            border: { width: 2, color: '#0470D8' },
                        },
                        legendShape: 'Circle',
                        yName: 'Amount', name: 'Amount',
                        fill: 'rgba(4, 112, 216, 0.3)',
                        border: { width: 0.5, color: '#0470D8' }
                    }]
            });
            linechartObj.refresh();
        });

    /* tslint:enable */
    gridObj.setProperties({

        dataSource: window.expenseDS,
        //Initializing Chart Series
        query: new ej.data.Query().where(predicate).sortByDesc('DateTime').take(5)
    });
    gridObj.refresh();
    getTotalExpense();
    pie.series = getSeries();
    pie.dataBind();
    pie.refresh();
    createLegendData('pieUpdate');
    grid.dataSource = pieRenderData;
    grid.dataBind();
    grid.refresh();
    formatRangeDate();
}
function getSeries() {
    var series = [
        {
            dataSource: pieRenderingData,
            xName: 'text',
            yName: 'y',
            radius: '83%',
            startAngle: 0,
            endAngle: 360,
            innerRadius: '50%',
            dataLabel: {
                name: 'x',
                visible: true,
                position: 'Outside',
                connectorStyle: { length: '10%' },
                font: {
                    color: 'Black',
                    size: '14px',
                    fontFamily: 'Roboto'
                }
            },
            animation: { enable: false },
            palettes: ['#61EFCD', '#CDDE1F', '#FEC200', '#CA765A', '#2485FA', '#F57D7D', '#C152D2',
                '#8854D9', '#3D4EB8', '#00BCD7']
        }
    ];
    return series;
}
function DateRange() {
    dateRangePickerObject = new ej.calendars.DateRangePicker({
        format: 'MM/dd/yyyy', change: onDateRangeChange,
        startDate: window.startDate,
        endDate: window.endDate,
        showClearButton: false,
        allowEdit: false,
        presets: [
            { label: 'Last Month', start: new Date('10/1/2017'), end: new Date('10/31/2017') },
            { label: 'Last 3 Months', start: new Date('9/1/2017'), end: new Date('11/30/2017') },
            { label: 'All Time', start: new Date('6/1/2017'), end: new Date('11/30/2017') }
        ]
    });
    dateRangePickerObject.appendTo('#daterange');
    window.startDate = dateRangePickerObject.startDate;
    window.endDate = dateRangePickerObject.endDate;
}
var centerTitle = document.createElement('div');
centerTitle.innerHTML = 'Expenses <br> Year    2013';
centerTitle.style.position = 'absolute';
centerTitle.style.visibility = 'hidden';

function getFontSize(width) {
    if (width > 300) {
        return '13px';
    } else if (width > 250) {
        return '8px';
    } else {
        return '6px';
    }
}

function createLegendData(initiate) {
    if (pieRenderingData.length > 10) {
        pie.series[0].groupTo = groupValue.toString();
        pie.dataBind();
        pie.refresh();
    }
    if (initiate === 'pieUpdate' || pieLegendData.length === 0) {
        pieLegendData = [];
        pieLegendData = pie.visibleSeries[0].points;
    }
    pie.legendSettings.visible = false;
    pie.dataBind();
    pieRenderData = [];
    for (var i = 0; i < pieLegendData.length; i++) {
        /* tslint:disable-next-line */
        var data = pieLegendData[i];
        /* tslint:enable-next-line */
        if (data.text.indexOf('Others') > -1) {
            data.x = ((data.y / expTotal) * 100).toFixed(2).toString() + '%';
        }
        pieRenderData.push(data);
    }
}



// tslint:disable-next-line:max-func-body-length
function InitializeComponet() {
    // interface Result {
    //     result: Object;
    // }   
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = window.userName;
    }
    cardUpdate();
    /* tslint:disable-next-line */
    new ej.data.DataManager(window.expenseDS)
        .executeQuery(new ej.data.Query().where(predicate.and('TransactionType', 'equal', 'Expense')))
        /* tslint:disable-next-line */
        .then(function (e) {
            getCoulmnChartExpenseDS(e);
        });
    new ej.data.DataManager(window.expenseDS)
        .executeQuery(new ej.data.Query().where(predicate.and('TransactionType', 'equal', 'Income')))
        /* tslint:disable-next-line */
        .then(function (e) {
            getCoulmnChartIncomeDS(e);
            columnChartObj = new ej.charts.Chart({
                //Initializing Primary X Axis
                primaryXAxis: {
                    labelFormat: 'MMM',
                    valueType: 'DateTime',
                    intervalType: 'Months',
                    edgeLabelPlacement: 'Shift'
                },
                //Initializing Primary Y Axis
                primaryYAxis: {
                    minimum: 3000,
                    maximum: 9000,
                    labelFormat: 'c0'
                },
                useGroupingSeparator: true,
                series: [
                    {
                        type: 'Column',
                        dataSource: columnIncomeDS,
                        xName: 'DateTime',
                        width: 2,
                        yName: 'Amount',
                        name: 'Income',
                        legendShape: 'Circle',
                        marker: {
                            visible: true, height: 10, width: 10
                        },
                        border: { width: 0.5, color: '#A16EE5' },
                        fill: '#A16EE5',
                        animation: { enable: false },
                    },
                    {
                        type: 'Column',
                        legendShape: 'Circle',
                        name: 'Expense',
                        dataSource: columnExpenseDS,
                        xName: 'DateTime',
                        width: 2,
                        yName: 'Amount',
                        marker: {
                            visible: true, height: 10, width: 10
                        },
                        fill: '#4472C4',
                        animation: { enable: false },
                    },
                ],
                annotations: [{
                    // tslint:disable-next-line:max-line-length
                    content: '<p style="font-family:Roboto;font-size: 16px;font-weight: 400;font-weight: 400;letter-spacing: 0.02em;line-height: 16px;color: #797979 !important;">Income - Expense</p>',
                    x: '75px', y: '9%', coordinateUnits: 'Pixel', region: 'Chart'
                }],
                margin: { top: 90 },
                legendSettings: { visible: true },
                titleStyle: {
                    textAlignment: 'Near', fontWeight: '500', size: '16', color: '#000'
                },
                tooltip: {
                    fill: '#707070',
                    enable: true,
                    shared: true,
                    format: '${series.name} : ${point.y}',
                    header: 'Month - ${point.x} ',
                }
            });
            columnChartObj.appendTo('#account-balance');
            getLineChartDS();
            /* tslint:disable */
            var content = '<p style="font-family:Roboto;font-size: 16px;font-weight: 400;font-weight: 400;letter-spacing: 0.02em;line-height: 16px;color: #797979 !important;">Account - Balance</p>';
            /* tslint:eanble */
            linechartObj = new ej.charts.Chart({
                //Initializing Primary X Axis
                primaryXAxis: {
                    valueType: 'DateTime',
                    labelFormat: 'MMM',
                    majorGridLines: { width: 0 },
                    intervalType: 'Months'
                },
                //Initializing Primary Y Axis
                primaryYAxis: {
                    maximum: 1800,
                    interval: 300,
                    labelFormat: 'c0',
                },
                useGroupingSeparator: true,
                chartArea: {
                    border: {
                        width: 0
                    }
                },
                annotations: [{
                    content: content,
                    x: '75px', y: '9%', coordinateUnits: 'Pixel', region: 'Chart'
                }],
                series: [
                    {
                        type: 'Area',
                        dataSource: lineDS,
                        xName: 'DateTime', width: 2, marker: {
                            visible: true,
                            width: 10,
                            height: 10,
                            fill: 'white',
                            border: { width: 2, color: '#0470D8' },
                        },
                        yName: 'Amount', name: 'Amount',
                        fill: 'rgba(4, 112, 216, 0.3)',
                        border: { width: 0.5, color: '#0470D8' }
                    },

                ],
                margin: { top: 90 },
                tooltip: {
                    fill: '#707070',
                    enable: true, shared: true,
                    format: '${series.name} : ${point.y}',
                    header: 'Month - ${point.x} '
                }
            });
            linechartObj.appendTo('#balance');

        });
    pie = new ej.charts.AccumulationChart({
        enableSmartLabels: true,
        width: '100%',
        height: '350px',
        series: getSeries(),
        legendSettings: {
            visible: true
        },
        textRender: function (args) {
            args.series.dataLabel.font.size = getFontSize(pie.initialClipRect.width);
            pie.animateSeries = true;
            if (args.text.indexOf('Others') > -1) {
                args.text = 'Others';
            }
        },
        animationComplete: function (args) {
            var element = document.getElementById('total-expense_datalabel_Series_0');
            if (!isNOU(element)) { element.style.visibility = 'visible'; }
        }
    });
    pie.appendTo('#total-expense');
    createLegendData('pie');
    grid = new ej.grids.Grid({
        width: '100%',
        dataSource: pieRenderData,
        rowTemplate: '#rowtemplate',
        columns: [
            { field: 'color', width: '10%', textAlign: 'Center' },
            { field: 'text', width: '50%' },
            { field: 'y', width: '20%' },
            { field: 'x', width: '20%' }
        ],
        load: function (args) {
            if (document.getElementById('grid-popup')) {
                document.getElementById('grid-popup').style.display = "block";
            }
        },
        dataBound: function (args) {
            if (document.getElementById('grid-popup')) {
                document.getElementById('grid-popup').style.display = "none";
            }
        }
    });
    grid.appendTo('#legend-grid');
    gridObj = new ej.grids.Grid({
        dataSource: dataSource,
        allowSorting: true,
        enableHover: false,
        allowKeyboard: true,
        allowPaging: false,
        query: new ej.data.Query().where(predicate).sortByDesc('DateTime').take(5),
        width: '100%',
        toolbar: [{ text: 'Recent Transactions' }],
        pageSettings: {
            pageCount: 4,
            pageSize: 14
        },
        columns: [
            {
                field: 'DateTime',
                headerText: 'Date',
                width: 120,
                format: 'yMd',
                hideAtMedia: '(min-width: 600px)',
                template: '#dateTemplate'
            }, {
                field: 'Category',
                headerText: 'Category',
                template: '#template',
                width: 170,
            },
            {
                field: 'PaymentMode',
                headerText: 'Payment Mode',
                width: 160,
                hideAtMedia: '(min-width: 600px)'
            },
            {
                field: 'Description',
                headerText: 'Description',
                hideAtMedia: '(min-width: 1050px)'
            },
            {
                field: 'Amount',
                headerText: 'Amount',
                width: 120,
                textAlign: 'Right',
                template: '#amtTemplate',
            }
        ]
    });
    gridObj.appendTo('#recentexpense-grid');
}
window.dashboard = function () {

    predicateStart = new ej.data.Predicate('DateTime', 'greaterthanorequal', window.startDate);
    predicateEnd = new ej.data.Predicate('DateTime', 'lessthanorequal', window.endDate);
    predicate = predicateStart.and(predicateEnd);
    getTotalExpense();
    InitializeComponet();
    // DateRangePicker Initialization.
    DateRange();
    formatRangeDate();
    updateChart();
    window.addEventListener('resize', function () {
        setTimeout(function () {
            updateChart();
        }, 1000);
    });
};
function updateChart() {
    var pieContainerObj = document.getElementById('totalExpense');
    if (!ej.base.isNullOrUndefined(pieContainerObj) && pieContainerObj.offsetWidth < 480) {
        disableChartLabel();
    } else {
        enableChartLabel();
    }
}
function disableChartLabel() {
    pie.series[0].dataLabel.visible = false;
    pie.dataBind();
    pie.refresh();
}
function enableChartLabel() {
    pie.series[0].dataLabel.visible = true;
    pie.dataBind();
    pie.refresh();
}
function formatRangeDate() {
    var intl = new ej.base.Internationalization();
    var dateStart = intl.formatDate(dateRangePickerObject.startDate, { skeleton: 'MMMd' });
    var dateEnd = intl.formatDate(dateRangePickerObject.endDate, { skeleton: 'MMMd' });
    document.getElementById('rangeDate').textContent = dateStart + ' - ' + dateEnd;
}
function getTotalExpense() {
    expTotal = 0;
    category = [];
    legendData = [];
    var renderingData = [];
    /* tslint:disable-next-line */
    tempData.forEach(function (item) {
        if (item.TransactionType === 'Expense' && window.startDate.valueOf() <= item.DateTime.valueOf() && window.endDate.valueOf() >= item.DateTime.valueOf()) {
            expTotal += Number(item.Amount);
            legendData.push(item);
            if (category.indexOf(item.Category) < 0) {
                category.push(item.Category);
            }
        }
    });
    /* tslint:disable */
    category.forEach(function (str) {
        var total = 0;
        legendData.forEach(function (item) {
            if (str === item.Category) {
                total += Number(item.Amount);
            }
        });
        var percent = ((total / expTotal) * 100).toFixed(2) + '%';
        renderingData.push({ x: str, y: total, text: percent });
    });
    pieRenderingData = new ej.data.DataManager(JSON.parse(JSON.stringify(renderingData))).executeLocal((new ej.data.Query().sortByDesc('y')));
    if (pieRenderingData.length > 10) {
        var temp = new ej.data.DataManager(JSON.parse(JSON.stringify(renderingData))).executeLocal((new ej.data.Query().sortByDesc('y').range(0, 9)))[8];
        groupValue = temp.y - 1;
        hiGridData = new ej.data.DataManager(JSON.parse(JSON.stringify(renderingData))).executeLocal((new ej.data.Query().sortByDesc('y').skip(9)));
    }
}