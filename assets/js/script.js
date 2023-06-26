// Wrap all code that interacts with the DOM in a call to jQuery to ensure that
// the code isn't run until the browser has finished rendering all the elements
// in the html.
$(window).on('load', function() {
  // Get the reference to the schedule's container
  const hourContainer = $("main")
  // Set the current day from dayjs' API
  let currentDay = dayjs()
  // Set the current hour from the dayjs' API hour call, so we know what hour we're dealing with
  let currentTime = currentDay.hour()
  
  // Create a nav element to append the navigation buttons to, and append it to the header
  let navEl = $('<nav class="center"></nav>')
  $('header').append(navEl)
  
  // Create the "previous" and "next" buttons for calendar traversal
  let nextButton = $('<button class="nav-btn btn btn-primary" id="next-day">Next Day</button>')
  let prevButton = $('<button class="nav-btn btn btn-primary" id="prev-day">Prev Day</button>')
  // And append them to the nav
  $(navEl).append(prevButton, nextButton)
  // Set the "day change" animation duration in milliseconds
  var animationDuration = 1000

  // Make a handler for the "next day" button
  $('#next-day').on('click', function() {
    // Save the schedule before changing days
    saveSchedule()
    // Animate the entire schedule- the hour container- to the left out of screen, and animate opacity to zero
    hourContainer.animate({ 'left': '-=800px', 'opacity': '0' }, animationDuration, function() {
      // Fire the function to change the day +1
      changeDay(1)
      // Reset the animation offset and animate back to full opacity
      hourContainer.css({ 'left': '800px' });
      hourContainer.animate({ 'left': '0', 'opacity': '1' }, animationDuration)
    });
  });

  // Make a handler for the "prev day" button
  $('#prev-day').on('click', function() {
    // Save the schedule before changing days
    saveSchedule();
    // Animate the entire schedule- the hour container- to the right out of screen, and animate opacity to zero
    hourContainer.animate({ 'left': '+=800px', 'opacity': '0' }, animationDuration, function() {
      // Fire the function to change the day -1
      changeDay(-1)
      // Reset the animation offset and animate back to full opacity
      hourContainer.css({ 'left': '-800px' })
      hourContainer.animate({ 'left': '0', 'opacity': '1' }, animationDuration)
    })
  })

  // This function changes the day by first adding the incoming argument to the current day, then rendering the day.
  function changeDay(days) {
    currentDay = currentDay.add(days, 'day')
    renderDay()
  }

  // This function handles rendering the day
  function renderDay() {
    // First we set the schedule for the day in schedule by running getScheduleForDay
    let schedule = getScheduleForDay()
    // Then we set the text of the #current-day element, in a format that includes the day ordinals imported from the Advanced Formatting plugin from Dayjs
    $("#current-day").text(currentDay.format("dddd, MMMM Do"))
    // And we render the schedule
    renderSchedule(schedule)
  }

  // This function gets the schedule for the currently selected day.
  function getScheduleForDay() {
    // First we set the entire schedule to a local variable, parsing the data from localstorage or setting it to nothing if not possible
    const allSchedule = JSON.parse(localStorage.getItem('schedule')) || {}
    // Set the day's schedule from that calendar data, or create an empty schedule with the date format if non existent
    const daySchedule = allSchedule[currentDay.format("YYYY-MM-DD")] || createEmptySchedule()
    // And return created schedule for the day.
    return daySchedule
  }
  
  // This function creates an empty schedule in case the user has navigated to a page that doesnt exist in local storage. 
  function createEmptySchedule() {
    // First it creates an empty object for the day's data.
    let emptySchedule = {}
    // Then we loop over all hours of the day and create the day's object, with empty strings to make each hour's index element.
    for (let index = 0; index < 24; index++) {
      emptySchedule[index] = ""
    }
    // Then we return that empty schedule object.
    return emptySchedule
  }

  // This function is the meat n potatoes and renders the schedule whenever we change page etc, with the provided day's schedule argument.
  function renderSchedule(schedule) {
    // First we clear the hourContainer
    hourContainer.empty()
    // Then we set today to the current time with dayjs.
    let today = dayjs()
    // Next we check if the current day on state (the day we want to currently view) is before or after the day that we just set as today.
    let isPast = currentDay.isBefore(today, 'day')
    let isFuture = currentDay.isAfter(today, 'day')
    // Then we update the current time from the saved dayjs value's hour.
    let currentTime = today.hour()
    // We loop over all 24 hours in the day...
    for (let index = 0; index < 24; index++) {
      // Set the hour value based on the remainder of the index divided by 12, with 12 removed
      let hour = index % 12
      // If the hour is equal to 0, assign the value 12 to the hour variable
      hour = (hour === 0) ? 12 : hour
      // Determine the meridiem (AM/PM) based on the index value
      let meridiem = (index < 12 || index === 24) ? "AM" : "PM"
      // Concatenate the hour and meridiem variables together and assign the resulting string to the timeVal variable
      let timeVal = hour + meridiem;
      // This section adds classes for past, present, and future hours, first by declaring the variable...
      let timeRelevance = ""
      // Then check if isPast is true, if so it sets the currently being created parent element to inherit the "past" class
      if (isPast) {
          timeRelevance = "past"
        }
      // Otherwise if isFuture is true, inherit "future" class 
      else if (isFuture) {
          timeRelevance = "future"
        } 
      // Otherwise check if the index is less than the currentTime, do the same check for the actual days labels, and if both of those fail as well, it is the present.
        else {
          if (index < currentTime) {
              timeRelevance = "past"
          } else if (index > currentTime) {
              timeRelevance = "future"
          } else {
              timeRelevance = "present"
          }
      }
      //Create the timeblock label, so we dont have to have 200 lines of code doing this in our html file.
      let hourDiv = $('<div id="hour-' + index + '"' + ' class="row time-block ' + timeRelevance + '"></div>')
      let timeText = $('<div id="time-text-box" class="col-2 col-md-1 text-center py-3">' + timeVal + '</div>')
      let inputArea = $('<textarea class="col-8 col-md-10 description" rows="3">' + (schedule[index] || "") + '</textarea>')
      let saveButton = $('<button class="btn saveBtn col-2 col-md-1" aria-label="save"></button>')
      let saveImage = $('<i class="fas fa-save" aria-hidden="true"></i>')
      // and append it all to the main hourDiv, then appending the hourDiv to the main container.
      hourDiv.append(timeText, inputArea, saveButton.append(saveImage))
      hourContainer.append(hourDiv)
    }
  }

  //This function saves our schedule when the "save button" is clicked
  function saveSchedule() {
    //First it creates an empty schedule, and goes over each time-block element in the page and takes their ID, hourIndex, and the contents of the text box, putting it in the empty schedule
    let schedule = {};
    $('.time-block').each(function() {
      let id = $(this).attr('id')
      let hourIndex = parseInt(id.split("-").pop()) 
      let inputAreaText = $(this).children('textarea.description').val()
      schedule[hourIndex] = inputAreaText
    })
    // Then parse the existing schedule from localstorage, and format the current scedule to the date for easier retreival. Finally set it in localstorage.
    const allSchedule = JSON.parse(localStorage.getItem('schedule')) || {}
    allSchedule[currentDay.format("YYYY-MM-DD")] = schedule
    localStorage.setItem('schedule', JSON.stringify(allSchedule))
  }

  // Make an event handler to handle when any save button is clicked, firing the saveSchedule function
  $(document).on('click', '.saveBtn', function() {
    saveSchedule();
  })

  // Make a function to update the current hour every hour
  function updateHour() {
    // Set the new day in case of the hour turning 12AM
    let newDay = dayjs();
    // If the day is a new day, fire the animation to make container slide to the left
    if (newDay.format("YYYY-MM-DD") !== currentDay.format("YYYY-MM-DD")) {
      hourContainer.animate({ 'left': '-=800px', 'opacity': '0' }, animationDuration, function() {
        changeDay(1);
        hourContainer.css({ 'left': '800px' });
        hourContainer.animate({ 'left': '0', 'opacity': '1' }, animationDuration);
      });
    }
    // Set the amount of milliseconds until next hour, and wait for the hour change to update
    let msUntilNextHour = 60 * 60 * 1000 - (newDay.valueOf() % (60 * 60 * 1000))
    setTimeout(updateHour, msUntilNextHour)  
  }

  // Render the page and update the hour when the page is loaded.
  renderDay()
  updateHour()
})