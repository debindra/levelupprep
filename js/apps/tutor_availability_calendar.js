class Calendar {
    get options() {
        return {};
    }

    constructor(options = {}) {
        this.settings = Object.assign(this.options, options);
        this.colorMap = this._getColorMap();
        this.calendar = null;
        this.eventStartTime = null;
        this.eventEndTime = null;
        this.currentEventId = null;
        this.recurring = null;
        this.noOfWeeks = null;
        this.availabilityId = null;
        this.initialDate = null;
        this.initialView= 'timeGridWeek';

        this.newEventModal = new bootstrap.Modal(document.getElementById('newEventModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        this.bookingConfirmationModal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
        // this._callDataLoad();

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/onlyavilable/bytutor/' + document.getElementById('tutorIdValue').value + '?student_id=' + document.getElementById('studentId').value), (data) => {
            this.events = data.data;
        // this.event
        this._addColors();
        this._alterEventsForDemo();
        this._initTimepicker();
        this._initCategory();
        this._init();
        this._addListeners();
    });
    }

    _init() {
        if (!document.getElementById('calendar') || !document.getElementById('calendarTitle') || typeof FullCalendar === 'undefined') {
            return;
        }
        this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            timeZone: 'local',
            themeSystem: 'bootstrap',
            allDaySlot: false,
            initialView: this.initialView,
            showNonCurrentDates: false,
            initialDate: this.initialDate,
            editable: false,
            dayMaxEvents: false,
            displayEventEnd:false,
            eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: true,
                hour12: true,
            },
            headerToolbar: {
                left: 'title',
                center: '',
                right: '',
            },
            viewDidMount: (args) => {
            this._updateTitle();
    },
        eventClick: this._eventClick.bind(this),
            eventAdd: this._eventAddCallback.bind(this),
            eventChange: this._eventChangeCallback.bind(this),
            eventRemove: this._eventRemoveCallback.bind(this),
            events: this.events,
    });
        this.calendar.render();
    }
    _callDataLoad(){

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/onlyavilable/bytutor/' + document.getElementById('tutorIdValue').value  + '?student_id=' + document.getElementById('studentId').value), (data) => {
            this.events = data.data;
        // this.event
        this._addColors();
        // this._alterEventsForDemo();
        this._initTimepicker();
        this._initCategory();
        this._init();
        this._addListeners();
    });
    }

    _callDataLoadLater(start,end,type){

        let params = {
            start,
            end,
            type
        };
        params = jQuery.param(params)

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/onlyavilable/bytutor/' + document.getElementById('tutorIdValue').value +'?' + 'student_id=' + document.getElementById('studentId').value +'&'+ params), (data) => {
            this.events = data.data;
        // this._addColors();
        // this._initTimepicker();
        this._init();
    });
    }


    _addListeners() {


        document.getElementById('goPrev') &&
        document.getElementById('goPrev').addEventListener('click', () => {
            this.calendar.prev();
        this._updateDataLoad(this.calendar.view);
        this._updateTitle();
    });

        document.getElementById('goNext') &&
        document.getElementById('goNext').addEventListener('click', () => {
            this.calendar.next();
        this._updateDataLoad(this.calendar.view);
        this._updateTitle();
    });

        document.getElementById('monthView') &&
        document.getElementById('monthView').addEventListener('click', () => {
            this.calendar.changeView('dayGridMonth');
        // this._updateDataLoad(this.calendar.view);
        this._updateTitle();
    });

        document.getElementById('weekView') &&
        document.getElementById('weekView').addEventListener('click', () => {
            this.calendar.changeView('timeGridWeek');
        // this._updateDataLoad(this.calendar.view);
        this._updateTitle();
    });

    //     document.getElementById('dayView') &&
    //     document.getElementById('dayView').addEventListener('click', () => {
    //         this.calendar.changeView('timeGridDay');
    //     this._updateTitle();
    // });

        document.documentElement.addEventListener(Globals.colorAttributeChange, this._updateAllColors.bind(this));
        document.getElementById('addNewEvent') && document.getElementById('addNewEvent').addEventListener('click', this._addNewEvent.bind(this));
        document.getElementById('addEvent') && document.getElementById('addEvent').addEventListener('click', this._addEventConfirm.bind(this));
        document.getElementById('saveEvent') && document.getElementById('saveEvent').addEventListener('click', this._updateEventConfirm.bind(this));
        document.getElementById('deleteEvent') && document.getElementById('deleteEvent').addEventListener('click', this._deleteEventClick.bind(this));
        document.getElementById('deleteConfirmButton') &&
        document.getElementById('deleteConfirmButton').addEventListener('click', this._deleteConfirmClick.bind(this));
    }

    // Updating title of the calendar, not event related
    _updateTitle() {
        document.getElementById('calendarTitle').innerHTML = this.calendar.view.title;
    }
    _updateDataLoad(data){
        const startDate = moment(data.currentStart).format('YYYY-MM-DD');
        const endDate = moment(data.currentEnd).format('YYYY-MM-DD');
        this.initialDate = startDate;
        this.initialView = data.type;
        this._callDataLoadLater(startDate, endDate , data.type);
    }


       // Filling the event details modal for showing the event
    _eventClick(info) {
        let isAllow30Mins = false;
        let vm = this;

        // this.paymentMethodModal.show();
        const event = info.event;
          if (event.url != '') {
            window.open(event.url, '_blank');
            info.jsEvent.preventDefault();
            return;
        }


    fetch("/api/v1/calendar/sixtyslot/check-availability", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
     body: JSON.stringify({
                    event: event.extendedProps,
                    start: new moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
                    })
  })
    .then(function(response) {
      return response.json();
    }).then(function(response) {
        vm._loadEventModal(event, response.success)
    });

    }


    _loadEventModal(event, is6MonthSlot){
        this._clearForm();
        this.currentEventId = event.id;
        const startTime = new moment(event.start).format('hh:mm:A');
        if (!event.allDay) {

            // this.eventStartTime.setTimeFromDateObject(new Date(event.start));
            this.eventStartTime.setTime(startTime);
        }
        jQuery('#eventStartDate').datepicker('update', event.start);
        const noOfWeeks = event.extendedProps.noOfWeeks;

              const customControlCon = document.getElementsByClassName("time-picker-container")[0];

            for(let i=0;i< 6;i++){
                 if((i%2 !== 0)){
                    customControlCon.childNodes[i].style.display="none";
                }

            }

            $('input:input[name="noOfWeeks"]').attr('max', noOfWeeks);

            if (noOfWeeks ===0){
                // $('input:checkbox[name="recurring"]').attr('disabled', true);
                $('#recurring-main').css('display', 'none');
            }else{
                $('#recurring-main').css('display', 'block');
            }

        $('input[type=checkbox][name=recurring]').on('change', function () {
            if($(this)[0].checked){
                $("#number-of-weeks").css("display", "block")
                $("#week-days").css("display", "block")
            }else{
                $("#number-of-weeks").css("display", "none")
                $("#week-days").css("display", "none")
            }
        });



        document.getElementById('noOfWeeks').value = noOfWeeks;
        this.availabilityId = event.extendedProps.availability_id;
        document.getElementById('availabilityOccurrenceId').value = event.id;
        this.availabilityOccurrenceId = event.extendedProps.ao_id
        // $("#number-of-weeks").css("display", "block")

    if(event.extendedProps.days){
         // $('#week-days').css("display", "block")
        if(event.extendedProps.days.split(',').length>1){
            event.extendedProps.days.split(',').forEach(item => {
                $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').attr('checked', true);
            $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').prop('disabled', false);
        });
        }else{
            event.extendedProps.days.split(',').forEach(item => {
                $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').attr('checked', true);
            // $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').prop('disabled', true);
        });
        }
    }else{
          $('#week-days').css("display", "none")
    }

        document.getElementById('modalTitle').innerHTML = 'Book A Tutoring Appointment';

        if(is6MonthSlot){
            $("#timeDurationOption").show();
        }else{
           $("#timeDurationOption").hide();
        }

        this.newEventModal.show();
        this._enableEdit();

    }


    // Filling the event details modal for showing the event
    // _eventClick(info) {
    //     // this.paymentMethodModal.show();
    //     const event = info.event;
    //     if (event.url != '') {
    //         window.open(event.url, '_blank');
    //         info.jsEvent.preventDefault();
    //         return;
    //     }
    //     this._clearForm();
    //     this.currentEventId = event.id;
    //     const startTime = new moment(event.start).format('hh:mm:A');
    //     if (!event.allDay) {
    //         // this.eventStartTime.setTimeFromDateObject(new Date(event.start));
    //         this.eventStartTime.setTime(startTime);
    //     }
    //     jQuery('#eventStartDate').datepicker('update', event.start);
    //     const noOfWeeks = event.extendedProps.noOfWeeks;
    //     // if(noOfWeeks > 0){
    //         $('input:input[name="noOfWeeks"]').attr('max', noOfWeeks);
    //     // }

    //         if (noOfWeeks ===0){
    //             // $('input:checkbox[name="recurring"]').attr('disabled', true);
    //             $('#recurring-main').css('display', 'none');
    //         }else{
    //             $('#recurring-main').css('display', 'block');
    //         }

    //     $('input[type=checkbox][name=recurring]').on('change', function () {
    //         if($(this)[0].checked){
    //             $("#number-of-weeks").css("display", "block")
    //             $("#week-days").css("display", "block")
    //         }else{
    //             $("#number-of-weeks").css("display", "none")
    //             $("#week-days").css("display", "none")
    //         }
    //     });


    //     document.getElementById('noOfWeeks').value = noOfWeeks;
    //     this.availabilityId = event.extendedProps.availability_id;
    //     document.getElementById('availabilityOccurrenceId').value = event.id;
    //     this.availabilityOccurrenceId = event.extendedProps.ao_id
    //     // $("#number-of-weeks").css("display", "block")

    // if(info.event.extendedProps.days){
    //      // $('#week-days').css("display", "block")
    //     if(info.event.extendedProps.days.split(',').length>1){
    //         info.event.extendedProps.days.split(',').forEach(item => {
    //             $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').attr('checked', true);
    //         $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').prop('disabled', false);
    //     });
    //     }else{
    //         info.event.extendedProps.days.split(',').forEach(item => {
    //             $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').attr('checked', true);
    //         // $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').prop('disabled', true);
    //     });
    //     }
    // }else{
    //       $('#week-days').css("display", "none")
    // }

    //     document.getElementById('modalTitle').innerHTML = 'Book A Tutoring Appointment';

    //     this.newEventModal.show();
    //     this._enableEdit();
    // }


_updateEventConfirm(){
    var vm = this;
    vm.changeLoadingState(true);
    vm._clearForm();

    vm.__getIntent( function() {
            vm.__submitPaymentInfo()
        }, function () {
        })


}

 __getIntent(onSuccess, onError) {

            const form = document.getElementById('stripeForm');

    if(initialSetupIntent && initialSetupIntent.client_secret){
            onSuccess()
    }else{
         var displayError = document.getElementById("card-errors");
          displayError.textContent = "Something went wrong, please reaload the page and try again!";
        onError();
    }

     var vm = this;
    var displayError = document.getElementById("card-errors");
    var email = document.getElementById("email").value;


    //    if(email === null || email === ''){
    //         displayError.textContent = 'Billing email address is required!';
    //    }else if(vm.__validateEmail(email)){
    //          displayError.textContent = 'Invalid billing email address';
    //    }
    // onError();

}

 __validateEmail(email){
        return String(email)
            .toLowerCase()
            .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        }


__submitPaymentInfo(onSuccess, onError) {
    var vm = this;
    var displayError = document.getElementById("card-errors");
    var email = document.getElementById("email").value;
    var name = document.getElementById("name").value;
    var phone = document.getElementById("phone").value;
    var line1 = document.getElementById("address").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    // var country = document.getElementById("country").value;
    var postalCode = document.getElementById("zip").value;

    //    if(email === null || email === ''){
    //         displayError.textContent = 'Billing email address is required!';
    //    }else if(vm.__validateEmail(email)){
    //          displayError.textContent = 'Invalid billing email address';
    //    }

    stripe
      .confirmCardSetup(initialSetupIntent.client_secret, {
        payment_method: {
          card: stripeCard,
          billing_details: {
              email: email || '',
              name: name || '',
              phone: phone || '',
              address: {
                  city: city || '',
                  state: state || '',
                //   country: country || '',
                  line1: line1 || '',
                  postal_code: postalCode || ''
              }
           }
        }
      })
      .then(function(result) {
        if (result.error) {
          vm.changeLoadingState(false);

          displayError.textContent = result.error.message;
        //    onError();
        } else {
          // The PaymentMethod was successfully set up
          vm.orderComplete(stripe, initialSetupIntent.client_secret, vm.__saveEvent);
        //   onSuccess();
        }
      });

    // onSuccess()
    //else
    // call onError
}

orderComplete(stripe, clientSecret, cb) {
    var vm = this;
  stripe.retrieveSetupIntent(clientSecret).then(function(result) {
    var setupIntent = result.setupIntent;
    var setupIntentJson = JSON.stringify(setupIntent, null, 2);

    const studentId = document.getElementById('studentId').value;
    const email = document.getElementById("email").value || '';
    const name = document.getElementById("name").value || '';

    const customer = {
        email : email,
        name : name
    };

       $.ajax({
            method: "POST",
            url: "/api/v1/student/payment-method/" + studentId,
            data: {setupIntent, initialSetupIntent, customer},
            dataType:"JSON",
            success: function(result){
                const params = {
                    availabilityId: vm.availabilityId,
                    currentEventId: vm.currentEventId,
                    bookingConfirmationModal: vm.bookingConfirmationModal,
                    newEventModal: vm.newEventModal,
                    paymentMethodId: result
                }
                cb(params);

            },
            error: function(results){

            }
        });


    // document.querySelector(".sr-payment-form").classList.add("hidden");
    // document.querySelector(".sr-result").classList.remove("hidden");


    vm.changeLoadingState(false);
  });
};

// Show a spinner on payment submission
changeLoadingState (isLoading) {
    if (isLoading) {
        document.querySelector("#saveEvent").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        // document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#saveEvent").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        // document.querySelector("#button-text").classList.remove("hidden");
    }
}


    // Updating earlier clicked event
    __saveEvent(params) {

        const subject = document.getElementById('selectFloating').value;
        const studentId = document.getElementById('studentId').value;
        const tutorId = document.getElementById('tutorId').value;

        // const recurring = document.getElementById('recurring').value;
        const noOfWeeks = document.getElementById('noOfWeeks').value;
        const duration = $("input[name='duration']:checked").val();
        // const eventDays = Array.from(document.querySelectorAll("input[type=checkbox][name=eventDays]:checked"), e => e.value);
        const updateParams = {
            tutor_availability_id: params.availabilityId,
            availability_occurrence_id: params.currentEventId,
            tutor_id:tutorId,
            student_id: studentId,
            subject: subject,
            payment_method_id: params.paymentMethodId,
            duration: duration
        };
        // if(document.getElementById("recurring").checked){ //If recurring is enabled
        //     updateParams.eventDays=  eventDays;
        //     updateParams.noOfWeeks=  noOfWeeks;
        //     updateParams.recurring=  recurring;
        // }

        // var modal = this.paymentMethodModal;
        var bookingConfirmModal = params.bookingConfirmationModal;
        $.ajax({
            method: "POST",
            url: "/api/v1/calendar/booking/" + params.availabilityId ,
            data: updateParams,
            dataType:"JSON",
            success: function(result){
                 bookingConfirmModal.show();
            },
            error: function(results){

            }
        });

        params.newEventModal.hide();
    }

    _updateAllOccurence(){
        const eventId = this.calendar.getEventById(this.currentEventId);
        console.log(eventId.id);
    }

    // Showing modal for adding a new event
    _addNewEvent() {
        this._clearForm();
        this.currentEventId = null;
        this._enableAdd();
        document.getElementById('modalTitle').innerHTML = 'Add Availability';
        this.newEventModal.show();
    }

    // Adding new event to the calendar
    _addEventConfirm() {
        alert("ADD clicked");
    }

    // Delete click that shows the confirmation modal
    _deleteEventClick() {
        const currentEvent = this.calendar.getEventById(this.currentEventId);
        document.getElementById('deleteConfirmDetail').innerHTML = currentEvent.title;
        this.deleteConfirmModal.show();
    }

    // Deleting event after confirmation
    _deleteConfirmClick() {
        const currentEvent = this.calendar.getEventById(this.currentEventId);
        currentEvent.remove();
        this.newEventModal.hide();
        this.deleteConfirmModal.hide();
    }

    _clearForm() {
        this.eventStartTime.reset();
        // this.eventEndTime.reset();
        // document.getElementById('eventCategory').value = null;
        jQuery('#eventCategory').trigger('change');
        jQuery('#eventStartDate').datepicker('update', '');
        // jQuery('#eventEndDate').datepicker('update', '');
    }

    _enableEdit() {
        this._showElement('saveEvent');
        this._showElement('saveAllEvent');
        this._showElement('deleteEvent');
        this._hideElement('addEvent');
    }

    _enableAdd() {
        this._hideElement('saveEvent');
        this._hideElement('saveAllEvent');
        this._hideElement('deleteEvent');
        this._showElement('addEvent');
    }

    _showElement(selector) {
        document.getElementById(selector) && document.getElementById(selector).classList.add('d-inline-block');
        document.getElementById(selector) && document.getElementById(selector).classList.remove('d-none');
    }

    _hideElement(selector) {
        document.getElementById(selector) && document.getElementById(selector).classList.remove('d-inline-block');
        document.getElementById(selector) && document.getElementById(selector).classList.add('d-none');
    }

    _getColorByCategory(category) {
        const selected = this.colorMap.find((colorItem) => {
            return colorItem.category === category;
    });
        if (selected) {
            return selected.color;
        } else {
            this.colorMap[0].color;
        }
    }

    // Getting color values from Globals and adding them in an array with the category
    _getColorMap() {
        return [
            {color: Globals.secondary, category: 'Open'},
            {color: Globals.primary, category: 'Booked'},
            {color: Globals.quaternary, category: 'Expired'},
        ];
    }

    // Updating color after calendar initialization
    _setColor(event) {
        const selectedColorItem = this._getColorByCategory(event.extendedProps.category);
        event.setProp('color', selectedColorItem);
    }

    // Adding colors based on the event category
    _addColors() {
        this.events.map((event) => {
            event.color = this._getColorByCategory(event.category);
    });
    }

    // Theme color change event that updates all the event colors
    _updateAllColors() {
        this.colorMap = this._getColorMap();
        const events = this.calendar.getEvents();
        events.map((event) => {
            this._setColor(event);
    });
    }

    // Initialization of TimePicker plugin for event start and end times
    _initTimepicker() {
        this.eventStartTime = new TimePicker(document.getElementById('eventStartTime'), {dropdownClassname: 'time-top-label-dropdown'});
        // this.eventEndTime = new TimePicker(document.getElementById('eventEndTime'), {dropdownClassname: 'time-top-label-dropdown'});
    }

    // Initialization of Select2 plugin for categories
    _initCategory() {
        function formatText(item) {
            if (jQuery(item.element).val()) {
                return jQuery(
                    '<div><span class="align-middle d-inline-block option-circle me-2 rounded-xl ' +
                    jQuery(item.element).data('class') +
                    '"></span> <span class="align-middle d-inline-block lh-1">' +
                    item.text +
                    '</span></div>',
                );
            }
        }
        if (jQuery().select2) {
            jQuery('#eventCategory').select2({
                minimumResultsForSearch: Infinity,
                dropdownCssClass: 'hide-first-option',
                templateSelection: formatText,
                templateResult: formatText,
            });
        }
    }

    // Altering dates of the events to this year and this month for demo purpose
    _alterEventsForDemo() {
        const thisMonth = new Date().getMonth() + 1;
        const thisYear = new Date().getFullYear();
        const thisMonthZeroAdded = thisMonth < 10 ? '0' + thisMonth : thisMonth;
        this.events.map((event) => {
            if (event.start) {
            let startArray = event.start.split('-');
            startArray[0] = thisYear;
            startArray[1] = thisMonthZeroAdded;
            event.start = startArray.join('-');
        }
        if (event.end) {
            let endArray = event.end.split('-');
            endArray[0] = thisYear;
            endArray[1] = thisMonthZeroAdded;
            event.end = endArray.join('-');
        }
    });
    }

    // Add event callback for getting the data to sync with server
    _eventAddCallback(args) {
        // console.log(args.event.toPlainObject());
    }

    // Removed event callback for getting the data to sync with server
    _eventRemoveCallback(args) {
        // console.log(args.event.toPlainObject());
    }

    // Change event callback for getting the data to sync with server
    _eventChangeCallback(args) {
        // console.log(args.event.toPlainObject());
    }
}
