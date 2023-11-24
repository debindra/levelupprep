/**
 *
 * AuthLogin
 *
 * Pages.Authentication.Login page content scripts. Initialized from scripts.js file.
 *
 *
 */

class AuthLogin {
    constructor() {
        // Initialization of the page plugins
        this._initForm();
    }

    // Form validation
    _initForm() {
        const form = document.getElementById('loginForm');
        if (!form) {
            return;
        }
        const validateOptions = {
            rules: {
                email: {
                    required: true,
                    email: true,
                },
                password: {
                    required: true
                }
            },
            messages: {
                email: {
                    email: 'Your email address must be in correct format!',
                },

            },
        };
        jQuery(form).validate(validateOptions);
        // form.addEventListener('submit', (event) => {
        //     event.preventDefault();e

        // event.stopPropagation();
        // if (jQuery(form).valid()) {
        //
        //     const formValues = {
        //         email: form.querySelector('[name="email"]').value,
        //         password: form.querySelector('[name="password"]').value,
        //     };
        //
        //     $.ajax({
        //         method:     "POST",
        //         url: `/Pages/Authentication/Login`,
        //         data: formValues,
        //         dataType:"HTML",
        //         success: function(result){
        //
        //             console.log("Success",result)
        //             window.location.href = "{{url('Dashboards/Default')}}";
        //         },
        //         error: function(results){
        //             console.log(JSON.parse(JSON.stringify(results)).responseText)
        //         }
        //     });
        //     return;
        // }
    // });
    }
}
