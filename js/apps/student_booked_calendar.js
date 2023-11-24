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
        this.newEventModal = new bootstrap.Modal(document.getElementById('newEventModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));

        Helpers.FetchJSON(Helpers.UrlFix(`/api/v1/calendar/student/${document.getElementById('studentIdCalendar').value}` ), (data) => {
            this.events = data.data;
        this._addColors();
        // this._initTimepicker();
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
            initialView: 'timeGridWeek',
            allDaySlot:false,
            editable: false,
            dayMaxEvents: true,
            displayEventEnd:false,
            eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: true,
                hour12: true,
            },
            customButtons: {
                bookedButton: {
                    text: 'Booked',
                    hint:'hh',
                    class:'btn-sm'

                },
                openButton: {
                    text: 'Open',
                    hint:'hh',
                    class:'btn-sm',
                },
                expiredButton: {
                    text: 'Expired',
                    hint:'hh',
                    class:'btn-sm'
                }
            },
            headerToolbar: {
                left: 'title',
                center: '',
                // center: 'dayGridMonth,timeGridWeek',
                // right: 'bookedButton,openButton,expiredButton',
                right: '',
                end: ''
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

    _addListeners() {
        document.getElementById('goToday') &&
        document.getElementById('goToday').addEventListener('click', () => {
            this.calendar.today();
        this._updateTitle();
    });

        document.getElementById('goPrev') &&
        document.getElementById('goPrev').addEventListener('click', () => {
            this.calendar.prev();
        this._updateTitle();
    });

        document.getElementById('goNext') &&
        document.getElementById('goNext').addEventListener('click', () => {
            this.calendar.next();
        this._updateTitle();
    });

        document.getElementById('monthView') &&
        document.getElementById('monthView').addEventListener('click', () => {
            this.calendar.changeView('dayGridMonth');
        this._updateTitle();
    });

        document.getElementById('weekView') &&
        document.getElementById('weekView').addEventListener('click', () => {
            this.calendar.changeView('timeGridWeek');
        this._updateTitle();
    });

        document.getElementById('dayView') &&
        document.getElementById('dayView').addEventListener('click', () => {
            this.calendar.changeView('timeGridDay');
        this._updateTitle();
    });

        document.documentElement.addEventListener(Globals.colorAttributeChange, this._updateAllColors.bind(this));
        document.getElementById('addNewEvent') && document.getElementById('addNewEvent').addEventListener('click', this._addNewEvent.bind(this));
        document.getElementById('addEvent') && document.getElementById('addEvent').addEventListener('click', this._addEventConfirm.bind(this));
        // document.getElementById('saveEvent') && document.getElementById('saveEvent').addEventListener('click', this._updateEventConfirm.bind(this));
        // document.getElementById('saveAllEvent') && document.getElementById('saveAllEvent').addEventListener('click', this._updateAllOccurence.bind(this));

        document.getElementById('deleteEvent') && document.getElementById('deleteEvent').addEventListener('click', this._deleteEventClick.bind(this));

        document.getElementById('cancelConfirmButton') &&
        document.getElementById('cancelConfirmButton').addEventListener('click', this._cancelConfirmClick.bind(this));

        document.getElementById('cancelAllConfirmButton') &&
        document.getElementById('cancelAllConfirmButton').addEventListener('click', this._cancelAllConfirmClick.bind(this));
    }

    // Updating title of the calendar, not event related
    _updateTitle() {
        document.getElementById('calendarTitle').innerHTML = this.calendar.view.title;
    }

    // Filling the event details modal for showing the event
    _eventClick(info) {
        if(info.event.title === 'Booked'){
            const event = info.event;
            this.currentEventId = event.id;
            this.newEventModal.show();
        }

    }


    // Delete click that shows the confirmation modal
    _deleteEventClick() {
        const currentEvent = this.calendar.getEventById(this.currentEventId);
        // document.getElementById('deleteConfirmDetail').innerHTML = currentEvent.title;
           this.newEventModal.hide();
        this.deleteConfirmModal.show();
    }

    // Cancel event after confirmation
    _cancelConfirmClick() {

        const currentEvent = this.calendar.getEventById(this.currentEventId);
        const params = {
            availabilityId: currentEvent.extendedProps.tutor_availability_id,
            availabilityOccurrenceId: currentEvent.extendedProps.availability_occurrence_id
        };


        $.ajax({
            method: "PUT",
            url: "/api/v1/calendar/appointment/cancel",
            dataType:"JSON",
            data: params,
            success: function(result){
                setTimeout(function() {
                    window.location="/student/dashboard"
                }, 2000);
                jQuery.notify({title: 'Booking has been successfully cancelled.', message: ''}, {type: 'primary', delay: 3000});
            },
            error: function(results){

            }
        });


        currentEvent.remove();
        this.newEventModal.hide();
        this.deleteConfirmModal.hide();
    }

    _cancelAllConfirmClick() {
        const currentEvent = this.calendar.getEventById(this.currentEventId);
        const params = {
            availabilityId: currentEvent.extendedProps.tutor_availability_id
        };

         $.ajax({
            method: "PUT",
            url: "/api/v1/calendar/appointment/cancel",
            dataType:"JSON",
            data: params,
            success: function(result){
                setTimeout(function() {
                    window.location="/student/dashboard"
                }, 2000);
                jQuery.notify({title: 'Booking has been successfully cancelled.', message: ''}, {type: 'primary', delay: 3000});
            },
            error: function(results){

            }
        });


        currentEvent.remove();
        this.newEventModal.hide();
        this.deleteConfirmModal.hide();
    }

    _clearForm() {
        this.eventStartTime.reset();
        // this.eventEndTime.reset();
        // document.getElementById('eventTitle').value = '';
        // document.getElementById('eventCategory').value = null;
        jQuery('#eventCategory').trigger('change');
        jQuery('#eventStartDate').datepicker('update', '');
        // jQuery('#eventEndDate').datepicker('update', '');
    }

    _enableEdit() {
        // this._showElement('saveEvent');
        this._showElement('saveAllEvent');
        this._showElement('deleteEvent');
        this._hideElement('addEvent');
    }

    _enableAdd() {
        // this._hideElement('saveEvent');
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
            {color: Globals.primary, category: 'Booked'},
            {color: Globals.secondary, category: 'Open'},
            {color: Globals.quaternary, category: 'Expired'}

        ];
    }

    // Updating color after calendar initialization
    _setColor(event) {
        const selectedColorItem = this._getColorByCategory(event.extendedProps.category);
        console.log(selectedColorItem)
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
