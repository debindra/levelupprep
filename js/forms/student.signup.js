class StudentSignUp {

    constructor() {
        // Initialization of the page plugins
        if (!jQuery().validate) {
            console.log('validate is undefined!');
            return;
        }
        this._initTimeZoneSelection();
    }

    _initTimeZoneSelection(){

        var _this = this;
        // var url = "{{ URL::to('')}}";
        this.stateSelect = jQuery('#addressState')
            .select2({
                ajax: {
                    url: '/api/ajax/timezones' ,
                    dataType: 'json',
                    delay: 50,
                    data: function (params) {
                        return {
                            search: {value: params.term},
                            page: params.page,
                        };
                    },
                    processResults: function (data, page) {
                        return {
                            results: data.data,
                        };
                    },
                    cache: true,
                },
                language: {
                    searching: function () {
                        return 'Retrieving...';
                    },
                },
                theme: 'bootstrap4',
                placeholder: 'Search',
                escapeMarkup: function (markup) {
                    return markup;
                },
                minimumInputLength: 0,
                minimumResultsForSearch: Infinity,
                templateResult: _this._formatResult,
                templateSelection: _this._formatResultSelection,
                dropdownCssClass: 'hide-search-searching',
            })
            .on('select2:select', function (e) {
                // Calling city select upon state change
                // _this._initCitySelect();
            })
            .on('change', function () {
                jQuery(this).valid();
            });


    }

    // Formatting the select2 results
     _formatResult(result)
    {
        if (result.loading) return result.text;
        var markup = "<div class='clearfix'><div>" + result.Name + '</div>';
        return markup;
    }

    // Formatting the select2 selection
    _formatResultSelection(result)
    {
        return result.Name;
    }

}