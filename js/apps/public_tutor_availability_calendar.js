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

        this._callDataLoad();

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/tutor/availability/' + document.getElementById('tutorIdValue').value), (data) => {
            this.events = data.data;
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
            editable: true,
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

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/tutor/availability/' + document.getElementById('tutorIdValue').value), (data) => {
        this.events = data.data;
        this._addColors();
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

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/tutor/availability/' + document.getElementById('tutorIdValue').value +'?' +params), (data) => {
            this.events = data.data;
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
        this._updateTitle();
    });



        document.documentElement.addEventListener(Globals.colorAttributeChange, this._updateAllColors.bind(this));
        document.getElementById('viewEvent') && document.getElementById('viewEvent').addEventListener('click', this._updateEventConfirm.bind(this));
   
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

            if (noOfWeeks === 0){
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

    if(event.extendedProps.days){
        if(event.extendedProps.days.split(',').length>1){
            event.extendedProps.days.split(',').forEach(item => {
                $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').attr('checked', true);
            $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').prop('disabled', false);
        });
        }else{
            event.extendedProps.days.split(',').forEach(item => {
                $('input:checkbox[name="eventDays"]').filter('[value=' + item + ']').attr('checked', true);
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


_updateEventConfirm(){

    $('#loginSignupAlert').show();

}



 _updateAllOccurence(){
        const eventId = this.calendar.getEventById(this.currentEventId);

}

   


    _clearForm() {
        this.eventStartTime.reset();
        jQuery('#eventCategory').trigger('change');
        jQuery('#eventStartDate').datepicker('update', '');
    }

    _enableEdit() {
        this._showElement('viewEvent');
        this._showElement('saveAllEvent');
        this._showElement('deleteEvent');
        this._hideElement('addEvent');
    }

    _enableAdd() {
        this._hideElement('viewEvent');
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
