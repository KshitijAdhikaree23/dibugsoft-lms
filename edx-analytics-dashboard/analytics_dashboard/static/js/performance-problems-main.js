require('d3');
require('underscore');
const DataTableView = require('views/data-table-view');
const StackedBarView = require('views/stacked-bar-view');

require(['load/init-page'], (page) => {
  'use strict';

  const model = page.models.courseModel;
  const graphSubmissionColumns = [
    {
      key: 'correct_submissions',
      percent_key: 'correct_percent',
      title: gettext('Correct'),
      className: 'text-right',
      type: 'number',
      color: '#4BB4FB',
    },
    {
      key: 'incorrect_submissions',
      percent_key: 'incorrect_percent',
      title: gettext('Incorrect'),
      className: 'text-right',
      type: 'number',
      color: '#CA0061',
    },
  ];
  let tableColumns = [
    {
      key: 'index', title: gettext('Order'), type: 'number', className: 'text-right',
    },
    { key: 'name', title: model.get('contentTableHeading'), type: 'hasNull' }];
  let performanceProblemsChart;

  tableColumns = tableColumns.concat(graphSubmissionColumns);

  tableColumns.push({
    key: 'total_submissions',
    title: gettext('Total'),
    className: 'text-right',
    type: 'number',
    color: '#4BB4FB',
  });

  tableColumns.push({
    key: 'correct_percent',
    title: gettext('Percentage Correct'),
    className: 'text-right',
    type: 'percent',
  });

  if (model.get('hasData')) {
    performanceProblemsChart = new StackedBarView({
      el: '#chart-view',
      model,
      modelAttribute: 'primaryContent',
      trends: graphSubmissionColumns,
    });
    performanceProblemsChart.renderIfDataAvailable();
  }

  const performanceProblemsTable = new DataTableView({
    el: '[data-role=data-table]',
    model,
    modelAttribute: 'primaryContent',
    columns: tableColumns,
    sorting: ['index'],
    replaceZero: '-',
  });
  performanceProblemsTable.renderIfDataAvailable();
});
