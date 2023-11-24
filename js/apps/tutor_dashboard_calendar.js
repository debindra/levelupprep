
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

        // this.newEventModal = new bootstrap.Modal(document.getElementById('newEventModal'));
        // this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));

        this._callDataLoad()
    }

    _init() {
        if (!document.getElementById('calendar') || !document.getElementById('calendarTitle') || typeof FullCalendar === 'undefined') {
            return;
        }
        this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            timeZone: 'local',
            themeSystem: 'bootstrap',
            initialView: 'timeGridWeek',
            allDaySlot: false,
            editable: true,
            dayMaxEvents: true,
            displayEventEnd:false,
            eventTimeFormat: {
                // hour: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                // minute: 'numeric',
                meridiem: false,
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
                right: 'bookedButton,openButton,expiredButton',
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
        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/bytutor/'+ document.getElementById('tutorId').value), (data) => {
            this.events = data.data || [];
        this._addColors();

        this._initCategory();
        this._init();
        this._addListeners();
    });
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
            // alert(this.calendar.view.activeStart + this.calendar.view.activeEnd);
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

        document.getElementById('dayView') &&
        document.getElementById('dayView').addEventListener('click', () => {
            this.calendar.changeView('timeGridDay');
        this._updateTitle();
    });

    }

    // Updating title of the calendar, not event related
    _updateTitle() {
        document.getElementById('calendarTitle').innerHTML = this.calendar.view.title;
    }

    _updateDataLoad(data){

        const startDate = moment(data.currentStart).format('YYYY-MM-DD h:mm');
        const endDate = moment(data.currentEnd).format('YYYY-MM-DD h:mm');

        // window.location.href = "/tutor/availability?start="+startDate + "&end="+endDate + "&type="+data.type;

    }

    // Filling the event details modal for showing the event
    _eventClick(info) {
        const event = info.event;
        if (event.url != '') {
            window.open(event.url, '_blank');
            info.jsEvent.preventDefault();
            return;
        }
        this._clearForm();
        this.currentEventId = event.id;
        this.newEventModal.show();
    }

    _clearForm() {
        // this.eventStartTime.reset();

        jQuery('#eventCategory').trigger('change');
        jQuery('#eventStartDate').datepicker('update', '');
    }

    // _enableEdit() {
    //     this._showElement('saveEvent');
    //     this._showElement('deleteEvent');
    //     this._hideElement('addEvent');
    // }


    // _showElement(selector) {
    //     document.getElementById(selector) && document.getElementById(selector).classList.add('d-inline-block');
    //     document.getElementById(selector) && document.getElementById(selector).classList.remove('d-none');
    // }



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
