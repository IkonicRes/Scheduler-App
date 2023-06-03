// Wrap all code that interacts with the DOM in a call to jQuery to ensure that
// the code isn't run until the browser has finished rendering all the elements
// in the html.\


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
      hour = (hour === 0) ? 12 : hour; // to make 12 AM and 12 PM instead of 0
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
  let msUntilNextHour = 60 * 60 * 1000 - (new Date().getTime() % (60 * 60 * 1000))
  setTimeout(function() {
      updateHour()
      setInterval(updateHour, 60 * 60 * 1000)

  function updateHour() {
    let newHour = (currentTime + 13) % 24
    let newHourDiv = createHourDiv(newHour)
    hourContainer.children().first().remove()
    hourContainer.append(newHourDiv)
    currentTime = (currentTime + 1) % 24
  }

  setInterval(updateHour, 60 * 60 * 1000);

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

  // TODO: Add a listener for click events on the save button. This code should
// use the id in the containing time-block as a key to save the user input in
// local storage. HINT: What does `this` reference in the click listener
// function? How can DOM traversal be used to get the "hour-x" id of the
// time-block containing the button that was clicked? How might the id be
// useful when saving the description in local storage?
//
// TODO: Add code to apply the past, present, or future class to each time
// block by comparing the id to the current hour. HINTS: How can the id
// attribute of each time-block be used to conditionally add or remove the
// past, present, and future classes? How can Day.js be used to get the
// current hour in 24-hour time?
//
// TODO: Add code to get any user input that was saved in localStorage and set
// the values of the corresponding textarea elements. HINT: How can the id
// attribute of each time-block be used to do this?
//
// TODO: Add code to display the current date in the header of the page.
  });