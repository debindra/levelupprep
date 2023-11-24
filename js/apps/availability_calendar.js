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
        this.initialDate = null;
        this.initialView= 'timeGridWeek';

        this.newEventModal = new bootstrap.Modal(document.getElementById('newEventModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        this.warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

        this._callDataLoad()
    }

    _init() {
        if (!document.getElementById('calendar') || !document.getElementById('calendarTitle') || typeof FullCalendar === 'undefined') {
            return;
        }
        this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            timeZone: 'local',
            height: '70%',
            stickyHeaderDates: true,
            initialDate: this.initialDate,
            // initialDate: moment().add(1, "months"),

            // contentHeight:'auto',

            aspectRatio: 0.25,
            themeSystem: 'bootstrap',
            initialView: this.initialView,
            allDaySlot: false,
            editable: true,
            dayMaxEvents: true,
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
            selectable: true,
            select: this._eventSelect.bind(this),
            eventDrop: this._eventDrop.bind(this),
    });
        this.calendar.render();

    }
    _callDataLoad(start = null, end=null){

        let params = null;
        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/bytutor/'+ document.getElementById('tutorIdValue').value +'?' +params), (data) => {
            this.events = data.data || [];
        this._addColors();
        this._initTimepicker();
        this._initCategory();
        this._init();
        this._addListeners();
    });
    }
    _callDataLoadLater(start,end, type){

        let params = {
            start,
            end ,
            type
        };
        console.log(params);
        params = jQuery.param(params)
        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/calendar/bytutor/'+ document.getElementById('tutorIdValue').value +'?' +params), (data) => {
            this.events = data.data || [];
        // this._addColors();
        // this._initTimepicker();
        this._init();
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

        document.documentElement.addEventListener(Globals.colorAttributeChange, this._updateAllColors.bind(this));
        document.getElementById('addNewEvent') && document.getElementById('addNewEvent').addEventListener('click', this._addNewEvent.bind(this));
        document.getElementById('addEvent') && document.getElementById('addEvent').addEventListener('click', this._addEventConfirm.bind(this));
        document.getElementById('saveEvent') && document.getElementById('saveEvent').addEventListener('click', this._updateEventConfirm.bind(this));
        document.getElementById('deleteEvent') && document.getElementById('deleteEvent').addEventListener('click', this._deleteEventClick.bind(this));
        document.getElementById('deleteConfirmButton') &&
        document.getElementById('deleteConfirmButton').addEventListener('click', this._deleteConfirmClick.bind(this));

        document.getElementById('deleteAllConfirmButton') &&
        document.getElementById('deleteAllConfirmButton').addEventListener('click', this._deleteAllConfirmClick.bind(this));
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
       // window.location.href = "/tutor/availability?start="+startDate + "&end="+endDate + "&type="+data.type;

    }
    _eventSelect(info) {

        if (moment(info.start).hour() != moment().hour() && moment(info.start) < moment()) {
            this.warningModal.show();

            return false;
        }

        if (moment(info.start).add(45, 'minutes') < moment()) {

            this.warningModal.show();

            return false;
        }
        this._clearForm();
        this.currentEventId = null;
        jQuery('#eventStartDate').datepicker('update', info.start );
        const startTime = new moment(info.start).format('hh:mm:A');
        this.eventStartTime.setTime(startTime);
        this._enableAdd();
        document.getElementById('modalTitle').innerHTML = 'Add Availability';
        this.newEventModal.show();
    }
    // Filling the event details modal for showing the event
    _eventClick(info) {

        const event = info.event;
        console.log(event);
        if(event.extendedProps.category !== 'Expired') {

            if (event.url != '') {
                window.open(event.url, '_blank');
                info.jsEvent.preventDefault();
                return;
            }
            this._clearForm();
            this.currentEventId = event.id;
            const startTime = new moment(event.start).format('hh:mm:A');
            this.eventStartTime.setTime(startTime);


            jQuery('#eventStartDate').datepicker('update', event.start);
            const noOfWeeks = event.extendedProps.noOfWeeks;
            if (noOfWeeks > 0) {
                $('input:checkbox[name="recurring"]').attr('checked', true);
                $("#schedule").css("display", "block")
            }

            if (noOfWeeks > 0) {
                document.getElementById('noOfWeeks').value = noOfWeeks;
                document.getElementById('availabilityOccurrenceId').value = event.extendedProps.ao_id;
                $("#number-of-weeks").css("display", "block")
            }

            if (event.extendedProps.days) {

                event.extendedProps.days.split(',').forEach(item => {
                    $('input:checkbox[name="eventDays"]'
            ).
                filter('[value=' + item + ']').attr('checked', true);
            })
                ;
            }

            document.getElementById('modalTitle').innerHTML = 'Edit/Delete Your Availability';

            this.newEventModal.show();
            this._enableEdit();
        }else {
            this.warningModal.show();
        }
    }

    // Updating earlier clicked event
    _updateEventConfirm() {
        const currentEvent = this.calendar.getEventById(this.currentEventId);
        const startDate = new Date(jQuery('#eventStartDate').datepicker('getDate'));
        const startTime = new Date(this.eventStartTime.getTimeAsDateObject());
        // const endDate = new Date(jQuery('#eventEndDate').datepicker('getDate'));
        const recurring = document.getElementById('recurring').value;
        const noOfWeeks = document.getElementById('noOfWeeks').value;

        const endTime = startTime;
        let endDate = startDate ;

        if (recurring !== '' && noOfWeeks !=='') {
            endDate = moment(startDate).add( noOfWeeks * 7 ,'days').format('YYYY-MM-DD h:mm')
            endDate = new Date(endDate);

        } else {
            endDate = moment(endDate).format('YYYY-MM-DD');
        }


        const availabilityOccurrenceId = document.getElementById('availabilityOccurrenceId').value;

        startDate.setHours(startTime.getHours());
        startDate.setMinutes(startTime.getMinutes());

        currentEvent.start.getTime() !== startDate.getTime() && currentEvent.setStart(startDate);
        const eventDays = Array.from(document.querySelectorAll("input[type=checkbox][name=eventDays]:checked"), e => e.value);

        const updateParams = {
            start: moment(currentEvent.start).format('YYYY-MM-DD HH:mm'),
            noOfWeeks: noOfWeeks,
            // recurring: recurring,
            tutorId: document.getElementById("tutorIdValue").value,
            aiId: availabilityOccurrenceId,
            eventDays
        };
        // console.log("updateParams",updateParams);

        $.ajax({
            method: "PUT",
            url: "/api/v1/calendar/" + this.currentEventId,
            data: updateParams,
            dataType:"JSON",
            success: function(result){
                jQuery.notify({title: 'Availability has been successfully updated.', message: ''}, {type: 'primary', delay: 5000});


            },
            error: (results) =>{
                const response = JSON.parse(results.responseText).data;
                jQuery.notify({title:response, message: ''}, {type: 'danger', delay: 5000});
                this._refreshPage();
            }
        });



        this.newEventModal.hide();
    }

    _refreshPage() {

        setTimeout(() => {
            location.reload();
        }, 1000)
    }

    _eventDrop(info) {

        console.log(info)
        //5a7e5215-3bbf-48a8-b942-5d244a5d3ede 7am fri

        const event = info.event;
        const oldNodeId = info.oldEvent.id;
        const currentEvent = this.calendar.getEventById(event.id);
        const startDate =  moment(event.start).format('YYYY-MM-DD');
        const startTime = moment(event.start).format('HH:mm');

        const recurring = document.getElementById('recurring').value;
        const noOfWeeks = document.getElementById('noOfWeeks').value;

        const availabilityOccurrenceId = info.oldEvent.id;

        const eventDays = Array.from(document.querySelectorAll("input[type=checkbox][name=eventDays]:checked"), e => e.value);

        const updateParams = {
            start: moment(info.event.start).format('YYYY-MM-DD HH:mm'),
            noOfWeeks: noOfWeeks,
            // recurring: recurring,
            tutorId: document.getElementById("tutorIdValue").value,
            aiId: availabilityOccurrenceId,
            eventDays
        };

        console.log(updateParams)
        $.ajax({
            method: "PUT",
            url: "/api/v1/calendar/update-availability/" + currentEvent.id,
            data: updateParams,
            dataType:"JSON",
            success: function(result){
                jQuery.notify({title: 'Availability has been successfully updated.', message: ''}, {type: 'primary', delay: 5000});


            },
            error: (results) => {
                const response = JSON.parse(results.responseText).data;
                jQuery.notify({title:response, message: ''}, {type: 'danger', delay: 5000});
                this._refreshPage();
            }
        });
    }

    // Showing modal for adding a new event
    _addNewEvent() {
        this._clearForm();
        $('#recurring').prop('checked', false)
        $('#recurring').trigger('change')
        this.currentEventId = null;
        jQuery('#eventStartDate').datepicker('update', moment().format('YYYY-MM-DD HH:mm') );
        const startTime = new moment().add(4, 'hours').format('hh:00:A');
        this.eventStartTime.setTime(startTime);

        this._enableAdd();
        document.getElementById('modalTitle').innerHTML = 'Add Availability';
        this.newEventModal.show();
    }

    // Adding new event to the calendar
    _addEventConfirm() {

        let eventDays = Array.from(document.querySelectorAll("input[type=checkbox][name=eventDays]:checked"), e => e.value);
            let startDate = new Date(jQuery('#eventStartDate').datepicker('getDate'));
            let startTime = new Date(this.eventStartTime.getTimeAsDateObject());

            let recurring = document.getElementById('recurring').value;
            let noOfWeeks = document.getElementById('noOfWeeks').value;
            let tutorId = document.getElementById('tutorId').value;
            if (this.eventStartTime.getTime() !== '') {
                startDate.setHours(startTime.getHours());
                startDate.setMinutes(startTime.getMinutes());
            } else {
                startDate = moment(startDate).format('YYYY-MM-DD');
            }

            let endDate = startDate ;

            if (recurring !== '' && noOfWeeks !=='') {
                endDate = moment(startDate).add( noOfWeeks * 7 ,'days').format('YYYY-MM-DD HH:mm');
                endDate = new Date(endDate);

            } else {
                endDate = moment(endDate).format('YYYY-MM-DD');
            }


            $.ajax({
                method: "POST",
                url: "/api/v1/calendar/" + tutorId,
                data: {start: moment(startDate).format('YYYY-MM-DD HH:mm'),  recurring: recurring,
                    noOfWeeks: noOfWeeks,eventDays: eventDays},
                dataType:"JSON",
                success: (result) => {
                    this.success = true;
                    jQuery.notify({title: 'Tutor availability has been successfully added.', message: ''}, {type: 'primary', delay: 5000});

                    this._refreshPage();
                    // setTimeout(function() {
                    //     window.location="/tutor/availability"
                    // }, 5000);

                },
                error: (results) => {

                    jQuery.notify({title: 'Something went wrong.', message:JSON.parse(results.responseText).msg}, {type: 'danger', delay: 5000});

                    this._refreshPage();

                }
            });

            this.calendar.addEvent({
                // title: remarks??' available',
                recurring: recurring,
                noOfWeeks: noOfWeeks,
                start: startDate,
                end: endDate,
                daysOfWeek:4,
                // startRecur:'20121-12-01',
                // endRecur: '2021-12-20',
                id: this.calendar.getEvents().length > 0 ? Helpers.NextId(this.calendar.getEvents(), 'id') : 1,
                // category: category,
                // color: this._getColorByCategory(category),
                color: 'primary',
            });
            this.newEventModal.hide();




    }

    // Delete click that shows the confirmation modal
    _deleteEventClick() {
        const currentEvent = this.calendar.getEventById(this.currentEventId);
        // document.getElementById('deleteConfirmDetail').innerHTML = currentEvent.title;
        this.deleteConfirmModal.show();
    }

    // Deleting event after confirmation
    _deleteConfirmClick() {

        const currentEvent = this.calendar.getEventById(this.currentEventId);
        const availabilityOccurrenceId = document.getElementById('availabilityOccurrenceId').value;

        $.ajax({
            method: "PUT",
            url: "/api/v1/calendar/singleoccurrence/" + currentEvent.id,
            dataType:"JSON",
            success: (result) => {
                jQuery.notify({title: 'Availability has been successfully deleted.', message: ''}, {type: 'primary', delay: 3000});
                this._refreshPage();
            },
            error: function(results){

            }
        });


        currentEvent.remove();
        this.newEventModal.hide();
        this.deleteConfirmModal.hide();
    }
    _deleteAllConfirmClick(){
        const currentEvent = this.calendar.getEventById(this.currentEventId);

        $.ajax({
            method: "PUT",
            url: "/api/v1/calendar/alloccurrence/" + this.currentEventId,
            dataType:"JSON",
            success: (result) => {
                jQuery.notify({title: 'Availability has been successfully cancelled.', message: ''}, {type: 'primary', delay: 3000});

                this._refreshPage();
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
        this._showElement('saveEvent');
        this._showElement('deleteEvent');
        this._hideElement('addEvent');
    }

    _enableAdd() {
        this._hideElement('saveEvent');
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
            return selected.color ;
        } else {
            this.colorMap[0].color ;
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
                    'Hello </span></div>',
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
        console.log(args.event.toPlainObject());
    }

    // Removed event callback for getting the data to sync with server
    _eventRemoveCallback(args) {
        console.log(args.event.toPlainObject());
    }

    // Change event callback for getting the data to sync with server
    _eventChangeCallback(args) {
        console.log(args.event.toPlainObject());
    }
}
