define(
  ['datatables-bootstrap3-plugin/media/js/datatables-bootstrap3', 'jquery', 'js-natural-sort/dist/naturalsort',
    'underscore', 'utils/utils', 'views/attribute-listener-view'],
  (dt, $, naturalSort, _, Utils, AttributeListenerView) => {
    'use strict';

    const DataTableView = AttributeListenerView.extend({

      initialize(options) {
        const self = this;
        AttributeListenerView.prototype.initialize.call(this, options);

        self.options = options || {};
        self.options.sorting = options.sorting || [];

        self.addNaturalSort();
      },

      /**
             * Adds natural sort to the data table sorting.
             */
      addNaturalSort() {
        $.fn.dataTableExt.oSort['natural-asc'] = (a, b) => naturalSort(a, b); // eslint-disable-line no-param-reassign
        $.fn.dataTableExt.oSort['natural-desc'] = (a, b) => -naturalSort(a, b); // eslint-disable-line no-param-reassign
      },

      buildSorting() {
        const self = this;
        const dtSorting = [];
        const sortRegexp = /^(-?)(.*)/g;
        const columns = _.map(self.options.columns, (column) => column.key);

        _.each(self.options.sorting, (sorting) => {
          const match = sortRegexp.exec(sorting);
          const direction = match[1] === '-' ? 'desc' : 'asc';
          const index = columns.indexOf(match[2]);
          dtSorting.push([index, direction]);
        });

        return dtSorting;
      },

      /**
             * Builds rendering for different cells in the table.  This is
             * desirable for rendering dates, percentages, etc. while keeping
             * the table sortable by the underlying data (rather than what's
             * necessarily displayed).
             */
      buildColumnDefs() {
        const self = this;
        const defs = [];
        let iColumn = 0;
        _(self.options.columns).each((column) => {
        // default column definitions
          const def = {
            targets: iColumn,
            data(row) {
            // by default, display the value
              return row[column.key];
            },
            // this text is displayed in the header
            title: column.title,
            className: column.className || undefined,
          };

          // extend definitions to render different types of data
          if (column.type === 'date') {
            def.data = self.createFormatDateFunc(column.key);
          } else if (column.type === 'percent') {
            def.data = self.createFormatPercentFunc(column.key);
          } else if (column.type === 'number') {
            def.data = self.createFormatNumberFunc(column.key, column.fractionDigits);
          } else if (column.type === 'maxNumber') {
          // this is useful so that sorting is number based, but
          // '+' can be displayed after the maximum
            def.data = self.createFormatMaxNumberFunc(column.key, column.maxNumber);
            // this column has a mix of numbers and strings
            def.type = 'natural';
          } else if (column.type === 'bool') {
            def.data = self.createFormatBoolFunc(column.key);
          } else if (column.type === 'hasNull') {
            def.data = self.createFormatHasNullFunc(column.key);
          } else if (column.type === 'time') {
            def.data = self.createFormatTimeFunc(column.key);
          }

          defs.push(def);
          iColumn += 1;
        });
        return defs;
      },

      createFormatTimeFunc(columnKey) {
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          if (type === 'display') {
            display = Utils.formatTime(Number(value));
          }
          return display;
        };
      },

      /**
             * Returns a function used by datatables to format the cell for
             * numbers.
             */
      createFormatNumberFunc(columnKey, fractionDigits) {
        const self = this;
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          if (type === 'display') {
            if (_(self.options).has('replaceZero') && value === 0) {
              display = self.options.replaceZero;
            } else if (!_(value).isUndefined() && !_(value).isNull()) {
              display = Utils.localizeNumber(Number(value), fractionDigits);
            }
          }
          return display;
        };
      },

      /**
             * Returns a function used by datatables to format the cell for
             * dates.
             */
      createFormatDateFunc(columnKey) {
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          if (type === 'display') {
          // long month name, day, full year
            display = Utils.formatDate(value);
          }
          return display;
        };
      },

      /**
             * Returns a function used by datatables to format the cell for
             * to display a '+' after the maximum number.
             */
      createFormatMaxNumberFunc(columnKey, maxNumber) {
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          // isNaN() return true for strings -- e.g. 'Unknown'
          // eslint-disable-next-line no-restricted-globals
          if (type === 'display' && !isNaN(value)) {
            display = Utils.localizeNumber(value);
            if (value >= maxNumber) {
              display += '+';
            }
          }
          return display;
        };
      },

      /**
             * Returns a function used by datatables to format the cell for
             * percentages.
             */
      createFormatPercentFunc(columnKey) {
        const self = this;
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          if (type === 'display') {
            if (_(self.options).has('replaceZero') && value === 0) {
              display = self.options.replaceZero;
            } else if (_(self.options).has('replaceNull') && value === null) {
              display = self.options.replaceNull;
            } else {
              display = Utils.formatDisplayPercentage(value);
            }
          }
          return display;
        };
      },

      /**
             * Returns a function used by datatables to display null values as
             * "(empty)".
             */
      createFormatHasNullFunc(columnKey) {
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          if (type === 'display' && _(display).isNull()) {
          /**
                         * Translators: (empty) is displayed in a table and indicates no label/value.
                         * Keep text in the parenthesis or an equivalent symbol.
                         */
            display = gettext('(empty)');
          }
          return display;
        };
      },

      /**
             * Returns a function used by datatables to format the cell for
             * booleans (Correct vs -).
             */
      createFormatBoolFunc(columnKey) {
        return (row, type) => {
          const value = row[columnKey];
          let display = value;
          if (type === 'display') {
            if (value) {
            // Translators: "Correct" is displayed in a table..
              display = gettext('Correct');
            } else {
              display = '-';
            }
          }
          return display;
        };
      },

      render() {
        const self = this;
        AttributeListenerView.prototype.render.call(this);

        const $parent = $('<div/>', { class: 'table-responsive' }).appendTo(self.$el);
        const $table = $('<table/>', { class: 'table table-striped' }).appendTo($parent);
        const dtConfig = {
          paging: true,
          info: false,
          filter: false,
          data: self.model.get(self.options.modelAttribute),

          // providing 'columns' will override columnDefs
          columnDefs: self.buildColumnDefs(),

          // this positions the "length changing" control to the bottom using bootstrap styling
          // more information at http://datatables.net/examples/basic_init/dom.html
          dom: '<<t>><"row"<"col col-12 sm-col-12 md-col-6"l>'
                         + '<"col col-12 sm-col-12 md-col-6"p>>',

          // Disable auto-width as it causes the date column to wrap unnecessarily.
          autoWidth: false,
        };

        const dtSorting = self.buildSorting();

        if (dtSorting.length) {
          dtConfig.order = dtSorting;
        }

        $table.dataTable(dtConfig);

        // Fix the aria role usage
        $table.find('th').attr('role', 'columnheader').attr('scope', 'col');
        $table.find('td').attr('role', 'gridcell');

        return self;
      },

    });

    return DataTableView;
  },
);
