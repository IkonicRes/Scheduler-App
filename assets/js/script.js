$(window).on('load', function() {
  const hourContainer = $("#time-container")
  let currentDay = dayjs()
  let currentTime = currentDay.hour()
  let navEl = $('<nav class="center"></nav>')
  $('header').append(navEl)
  // Adding a next and previous day button
  let nextButton = $('<button class="btn btn-primary" id="next-day">Next Day</button>')
  let prevButton = $('<button class="btn btn-primary" id="prev-day">Previous Day</button>')

  $(navEl).append(prevButton, nextButton)

  // Handler for next day button
  $('#next-day').on('click', function() {
    saveSchedule();
    changeDay(1);
  });

  // Handler for previous day button
  $('#prev-day').on('click', function() {
    saveSchedule();
    changeDay(-1);
  });

  function changeDay(days) {
    currentDay = currentDay.add(days, 'day');
    renderDay();
  }

  function renderDay() {
    const schedule = getScheduleForDay();
    $("#current-day").text(currentDay.format("dddd, MMMM Do"))
    renderSchedule(schedule)
  }

  function getScheduleForDay() {
    const allSchedule = JSON.parse(localStorage.getItem('schedule')) || {};
    const daySchedule = allSchedule[currentDay.format("YYYY-MM-DD")] || createEmptySchedule();
    return daySchedule;
  }

  function createEmptySchedule() {
    let emptySchedule = {};
    for (let index = 0; index < 24; index++) {
      emptySchedule[index] = "";
    }
    return emptySchedule;
  }

  function renderSchedule(schedule) {
    hourContainer.empty()
    let today = dayjs();
    let isPast = currentDay.isBefore(today, 'day');
    let isFuture = currentDay.isAfter(today, 'day');
    for (let index = 0; index < 24; index++) {
        let hour = index % 12
        hour = (hour === 0) ? 12 : hour
        let meridiem = (index < 12 || index === 24) ? "AM" : "PM"
        let timeVal = hour + meridiem;
        // Add classes for past, present, and future hours
        let timeRelevance = ""
        if (isPast) {
            timeRelevance = "past"
        } else if (isFuture) {
            timeRelevance = "future"
        } else {
            if (index < currentTime) {
                timeRelevance = "past"
            } else if (index > currentTime) {
                timeRelevance = "future"
            } else {
                timeRelevance = "present"
            }
        }

        let hourDiv = $('<div id="hour-' + index + '"' + ' class="row time-block ' + timeRelevance + '"></div>')
        let timeText = $('<div id="time-text-box" class="col-2 col-md-1 hour text-center py-3">' + timeVal + '</div>')
        let inputArea = $('<textarea class="col-8 col-md-10 description" rows="3">' + (schedule[index] || "") + '</textarea>')
        let saveButton = $('<button class="btn saveBtn col-2 col-md-1" aria-label="save"></button>')
        let saveImage = $('<i class="fas fa-save" aria-hidden="true"></i>')

        hourDiv.append(timeText, inputArea, saveButton.append(saveImage))
        hourContainer.append(hourDiv)
    }
}
  function saveSchedule() {
    let schedule = {};
    $('.time-block').each(function() {
      let id = $(this).attr('id')
      let hourIndex = parseInt(id.split("-").pop()) 
      let inputAreaText = $(this).children('textarea.description').val()
      schedule[hourIndex] = inputAreaText
    })

    const allSchedule = JSON.parse(localStorage.getItem('schedule')) || {}
    allSchedule[currentDay.format("YYYY-MM-DD")] = schedule;
    localStorage.setItem('schedule', JSON.stringify(allSchedule))
  }

  // Save button handler
  $(document).on('click', '.saveBtn', function() {
    saveSchedule();
  })

  // Update hour every hour
  function updateHour() {
    let newDay = dayjs();
    if (newDay.format("YYYY-MM-DD") !== currentDay.format("YYYY-MM-DD")) {
      currentDay = newDay;
      renderDay();
    }
    let msUntilNextHour = 60 * 60 * 1000 - (newDay.valueOf() % (60 * 60 * 1000))
    setTimeout(updateHour, msUntilNextHour)  
  }

  renderDay()
  updateHour()
})