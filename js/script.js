document.addEventListener('DOMContentLoaded', function () {

  // ── View Toggle ──

  var posts = document.getElementById('posts');
  var viewButtons = document.querySelectorAll('.view-toggle__btn');

  viewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      viewButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      posts.className = 'posts posts--' + btn.dataset.view;
    });
  });

  // ── Datepicker ──

  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  var groups = document.querySelectorAll('[data-datepicker]');

  groups.forEach(function (group) {
    var input = group.querySelector('.datepicker-input');
    var calendarBtn = group.querySelector('.filters__calendar');
    var clearBtn = group.querySelector('.filters__clear');
    var picker = null;
    var currentMonth, currentYear, selectedDate;

    selectedDate = parseInputDate(input.value);
    if (selectedDate) {
      currentMonth = selectedDate.getMonth();
      currentYear = selectedDate.getFullYear();
    } else {
      var now = new Date();
      currentMonth = now.getMonth();
      currentYear = now.getFullYear();
    }

    function parseInputDate(str) {
      if (!str) return null;
      var parts = str.split('_');
      if (parts.length !== 3) return null;
      var d = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10) - 1;
      var y = parseInt(parts[2], 10);
      if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
      return new Date(y, m, d);
    }

    function formatDate(date) {
      var d = String(date.getDate()).padStart(2, '0');
      var m = String(date.getMonth() + 1).padStart(2, '0');
      var y = date.getFullYear();
      return d + '_' + m + '_' + y;
    }

    function createPicker() {
      picker = document.createElement('div');
      picker.className = 'datepicker';
      picker.innerHTML =
        '<div class="datepicker__header">' +
          '<button class="datepicker__nav" data-dir="-1">&laquo;</button>' +
          '<span class="datepicker__title"></span>' +
          '<button class="datepicker__nav" data-dir="1">&raquo;</button>' +
        '</div>' +
        '<div class="datepicker__weekdays"></div>' +
        '<div class="datepicker__days"></div>';

      var weekdaysEl = picker.querySelector('.datepicker__weekdays');
      WEEKDAYS.forEach(function (wd) {
        var span = document.createElement('span');
        span.className = 'datepicker__weekday';
        span.textContent = wd;
        weekdaysEl.appendChild(span);
      });

      picker.querySelectorAll('.datepicker__nav').forEach(function (nav) {
        nav.addEventListener('click', function (e) {
          e.stopPropagation();
          var dir = parseInt(nav.dataset.dir, 10);
          currentMonth += dir;
          if (currentMonth < 0) { currentMonth = 11; currentYear--; }
          if (currentMonth > 11) { currentMonth = 0; currentYear++; }
          renderDays();
        });
      });

      group.appendChild(picker);
    }

    function renderDays() {
      var titleEl = picker.querySelector('.datepicker__title');
      titleEl.textContent = MONTHS[currentMonth] + ' ' + currentYear;

      var daysEl = picker.querySelector('.datepicker__days');
      daysEl.innerHTML = '';

      var firstDay = new Date(currentYear, currentMonth, 1).getDay();
      var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      var daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

      var today = new Date();
      today.setHours(0, 0, 0, 0);

      for (var i = 0; i < firstDay; i++) {
        var dayNum = daysInPrev - firstDay + 1 + i;
        var btn = createDayButton(dayNum, true, false, false, i === 0);
        var prevMonth = currentMonth - 1;
        var prevYear = currentYear;
        if (prevMonth < 0) { prevMonth = 11; prevYear--; }
        btn.dataset.date = new Date(prevYear, prevMonth, dayNum).toISOString();
        daysEl.appendChild(btn);
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(currentYear, currentMonth, d);
        var isSunday = date.getDay() === 0;
        var isSelected = selectedDate && date.getTime() === selectedDate.getTime();
        var isToday = date.getTime() === today.getTime();
        var btn = createDayButton(d, false, isSelected, isToday, isSunday);
        btn.dataset.date = date.toISOString();
        daysEl.appendChild(btn);
      }

      var totalCells = firstDay + daysInMonth;
      var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (var j = 1; j <= remaining; j++) {
        var nextMonth = currentMonth + 1;
        var nextYear = currentYear;
        if (nextMonth > 11) { nextMonth = 0; nextYear++; }
        var isSunday = new Date(nextYear, nextMonth, j).getDay() === 0;
        var btn = createDayButton(j, true, false, false, isSunday);
        btn.dataset.date = new Date(nextYear, nextMonth, j).toISOString();
        daysEl.appendChild(btn);
      }

      daysEl.querySelectorAll('.datepicker__day').forEach(function (dayBtn) {
        dayBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          selectedDate = new Date(dayBtn.dataset.date);
          selectedDate.setHours(0, 0, 0, 0);
          input.value = formatDate(selectedDate);
          currentMonth = selectedDate.getMonth();
          currentYear = selectedDate.getFullYear();
          closePicker();
        });
      });
    }

    function createDayButton(num, isOutside, isSelected, isToday, isSunday) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var cls = 'datepicker__day';
      if (isSunday) cls += ' datepicker__day--sunday';
      if (isOutside) cls += ' datepicker__day--outside';
      if (isSelected) cls += ' datepicker__day--selected';
      if (isToday) cls += ' datepicker__day--today';
      btn.className = cls;
      btn.textContent = num;
      return btn;
    }

    function openPicker() {
      if (!picker) createPicker();
      renderDays();
      picker.classList.add('open');
    }

    function closePicker() {
      if (picker) picker.classList.remove('open');
    }

    function togglePicker() {
      if (picker && picker.classList.contains('open')) {
        closePicker();
      } else {
        closeAllPickers();
        openPicker();
      }
    }

    calendarBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePicker();
    });

    input.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePicker();
    });

    clearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      input.value = '';
      selectedDate = null;
      closePicker();
    });

    group._closePicker = closePicker;
  });

  function closeAllPickers() {
    groups.forEach(function (g) {
      if (g._closePicker) g._closePicker();
    });
  }

  document.addEventListener('click', function () {
    closeAllPickers();
  });

  groups.forEach(function (group) {
    group.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  });
});
