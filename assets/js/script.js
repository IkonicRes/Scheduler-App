// Wrap all code that interacts with the DOM in a call to jQuery to ensure that
// the code isn't run until the browser has finished rendering all the elements
// in the html.

$(window).on('load', function() {
  const td = new Date()
  const hourContainer = $("#time-container")
  scheduleExists = (localStorage.getItem('schedule') !== null)
  function createSchedule(currentHour, hourAM) {
    if(scheduleExists){
      currentSchedule = JSON.parse(localStorage.getItem('schedule'))
    }
    for(index = 0; index < 24; index++){
      let hour = index % 12; 
      hour = (hour === 0) ? 12 : hour
      let meridiem = (index < 12 || index === 24) ? "AM" : "PM";
      let timeVal = hour + meridiem
      let tLabelText = ""
      if (scheduleExists){
        tLabelText = currentSchedule[index].split("%").pop()
      }
      if (index > currentHour){
        timeRelevance = "future"
      }
      else if (index < currentHour){
        timeRelevance = "past"
      }
      else {
        timeRelevance = "present"
      }
      
      let hourDiv = $('<div id="hour-' + timeVal + '"' + ' class="row time-block ' + timeRelevance + '"></div>')
      let timeText = $('<div class="col-2 col-md-1 hour text-center py-3" id="time-text-box">' + timeVal + '</div>')
      let inputArea = $('<textarea class="col-8 col-md-10 description" rows="3">' + tLabelText + '</textarea>')
      let saveButton = $('<button class="btn saveBtn col-2 col-md-1" aria-label="save"></button>')
      let saveImage = $('<i class="fas fa-save" aria-hidden="true"></i>')
      
      hourDiv.append(timeText, inputArea, saveButton.append(saveImage))
      $(hourContainer).append(hourDiv)
    }
  }

  function createHourDiv(hour) {
    let hourVal = hour % 12 === 0 ? 12 : hour % 12; // Convert to 12-hour format
    let meridiem = hour < 12 || hour === 24 ? "AM" : "PM"; // Determine AM or PM
    let timeVal = hourVal + meridiem;
    let timeRelevance = hour === currentTime ? "present" : hour < currentTime ? "past" : "future"

    let hourDiv = $('<div id="hour-' + timeVal + '"' + ' class="row time-block ' + timeRelevance + '"></div>')
    let timeText = $('<div class="col-2 col-md-1 hour text-center py-3" id="time-text-box">' + timeVal + '</div>')
    let inputArea = $('<textarea class="col-8 col-md-10 description" rows="3"></textarea>')
    let saveButton = $('<button class="btn saveBtn col-2 col-md-1" aria-label="save"></button>')
    let saveImage = $('<i class="fas fa-save" aria-hidden="true"></i>')

    hourDiv.append(timeText, inputArea, saveButton.append(saveImage))

    return hourDiv;
  }

  let msUntilNextHour = .1 
  // 60 * 60 * 1000 - (new Date().getTime() % (60 * 60 * 1000))
  setTimeout(function() {
      updateHour()
      setInterval(updateHour, 60 * 60 * 1000)
  })

  function updateHour() {
    let newHour = (currentTime + 15) % 24
    let newHourDiv = createHourDiv(newHour)
    // Fade out the first child and remove it after it's hidden
    hourContainer.children().first().fadeOut(function() { $(this).remove()})
    // Animate the change in margin-top
    hourContainer.animate({ marginTop: "-=100px" }, 1000, function() {
    hourContainer.css({ marginTop: "0px" })
    hourContainer.children().first().remove() // Remove the first hour after the animation finishes
})
     // Append the new child and fade it in
     hourContainer.append(newHourDiv)
     newHourDiv.hide().fadeIn()
    currentTime = (currentTime + 1) % 24
  }

  setInterval(updateHour, 60 * 60 * 1000)

  function updateSchedule(newSchedule){
    if (scheduleExists){
      localStorage.clear("schedule")
    }
    localStorage.setItem("schedule", JSON.stringify(newSchedule))
  }
  
  const currentDate = dayjs().format("dddd, MMMM Do")
  var currentTime = dayjs().hour()
  $("#current-day").text(currentDate)
  createSchedule(currentTime)
  allSaveBtn = $(".saveBtn")
  
  $(allSaveBtn).on("click", function(){
    tScheduleArr = []
    $('.time-block').each(function(){
      let id = $(this).attr('id') // Get the id of the div
      id = id.split("-").pop()
      let inputAreaText = $(this).children('textarea.description').val() // Get the content of the textarea
      tScheduleArr.push(id + "%" + inputAreaText)
      })
      updateSchedule(tScheduleArr)
  })
})