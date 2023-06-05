$(window).on('load', function() {
  const hourContainer = $("#time-container")
  let scheduleExists = (localStorage.getItem('schedule') !== null)
  let currentTime = dayjs().hour()
  const currentDate = dayjs().format("dddd, MMMM Do")
  $("#current-day").text(currentDate)

  function createEmptySchedule() {
    let emptySchedule = [];
    for (let index = 0; index < 24; index++) {
      emptySchedule[index] = index + "%"
    }
    return emptySchedule;
  }

  function createSchedule(currentHour) {
    let currentSchedule = localStorage.getItem('schedule')
    let startHour = 0
    if (scheduleExists) {
      currentSchedule = JSON.parse(localStorage.getItem('schedule'))
    }
    for (index = 0; index <= 23; index++) {
      let altIndex = (startHour + index) % 24
      let hour = altIndex % 12
      hour = (hour === 0) ? 12 : hour
      let meridiem = (altIndex < 12 || altIndex === 24) ? "AM" : "PM"
      let timeVal = hour + meridiem;
      let tLabelText = ""
      if (scheduleExists && currentSchedule && currentSchedule[altIndex]) {
        tLabelText = currentSchedule[altIndex].split("%").pop()
      }

      let timeRelevance = ""
      if (index < 9) timeRelevance = "past"
      else if (index > 9 && index !== 25) timeRelevance = "future"
      else timeRelevance = "present"

      let hourDiv = $('<div id="hour-' + altIndex + '"' + ' class="row time-block ' + timeRelevance + '"></div>')
      let timeText = $('<div class="col-2 col-md-1 hour text-center py-3" id="time-text-box">' + timeVal + '</div>')
      let inputArea = $('<textarea class="col-8 col-md-10 description" rows="3">' + tLabelText + '</textarea>')
      let saveButton = $('<button class="btn saveBtn col-2 col-md-1" aria-label="save"></button>')
      let saveImage = $('<i class="fas fa-save" aria-hidden="true"></i>')

      hourDiv.append(timeText, inputArea, saveButton.append(saveImage))
      $(hourContainer).append(hourDiv)
    }
  }

  function createHourDiv(hour) {
    let hourVal = hour % 12 === 0 ? 12 : hour % 12 // Convert to 12-hour format
    let meridiem = hour < 12 || hour === 24 ? "AM" : "PM" // Determine AM or PM
    let timeVal = hourVal + meridiem;
    let hourDiff = (hour - currentTime + 24) % 24 // Difference taking into account overflow at 24
    let timeRelevance = ""

    if (hourDiff < 0) {
      timeRelevance = "past"
    } else if (hourDiff === 0) {
      timeRelevance = "present"
    } else {
      timeRelevance = "future"
    }

    let hourDiv = $('<div id="hour-' + timeVal + '"' + ' class="row time-block ' + timeRelevance + '"></div>')
    let timeText = $('<div class="col-2 col-md-1 hour text-center py-3" id="time-text-box">' + timeVal + '</div>')
    let inputArea = $('<textarea class="col-8 col-md-10 description" rows="3"></textarea>')
    let saveButton = $('<button class="btn saveBtn col-2 col-md-1" aria-label="save"></button>')
    let saveImage = $('<i class="fas fa-save" aria-hidden="true"></i>')

    hourDiv.append(timeText, inputArea, saveButton.append(saveImage))

    return hourDiv;
  }

  function updateSchedule(newSchedule) {
    if (scheduleExists) {
      localStorage.clear("schedule")
    }
    const formattedSchedule = newSchedule.map((scheduleItem, hourIndex) => {
      const meridiem = hourIndex < 12 || hourIndex === 24 ? "AM" : "PM"
      const currentDate = dayjs().format("MMM Do")
      return hourIndex + meridiem + "/" + currentDate + "%" + scheduleItem
    })
    localStorage.setItem("schedule", JSON.stringify(formattedSchedule))
  }

  let schedule = JSON.parse(localStorage.getItem("schedule"))

  if (!schedule) {
    schedule = createEmptySchedule()
    updateSchedule(schedule)
  }
  createSchedule(currentTime)
  let allSaveBtn = $(".saveBtn")
  $(allSaveBtn).on("click", function() {
    let tScheduleArr = []
    $('.time-block').each(function() {
      let id = $(this).attr('id')
      let hourIndex = parseInt(id.split("-").pop()) // Extract the hour index from the id
      let inputAreaText = $(this).children('textarea.description').val()
      tScheduleArr[hourIndex] = inputAreaText
    })
    console.log(tScheduleArr)
    updateSchedule(tScheduleArr)
  })

  
  updateHour()

  function updateHour() {
    if (dayjs().hour() != currentTime) {
      // Fade out the first child and remove it after it's hidden
      hourContainer.children().first().fadeOut(function() { $(this).remove(); })
    
      currentTime = (currentTime + 1) % 24
      let newHourDiv = createHourDiv((currentTime + 15) % 24)
      // Append the new child and fade it in
      hourContainer.append(newHourDiv)
      newHourDiv.hide().fadeIn()
    }
    let msUntilNextHour = 60 * 60 * 1000 - (dayjs().valueOf() % (60 * 60 * 1000))
    setTimeout(updateHour, msUntilNextHour)  
  }

})