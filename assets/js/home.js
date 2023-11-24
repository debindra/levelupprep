
$(document).ready(function() {
    let gradeEight = $('#gradeEight');
    let gradeTwelve = $('#gradeTwelve');

        gradeEight.show()
        gradeTwelve.hide()

    $('#gradeSwitchToggle').change(function() {
        if(this.checked) {
            gradeEight.hide()
            gradeTwelve.show()
            $('#gradeEightText').addClass('opacity-8')
            $('#gradeTwelveText').removeClass('opacity-8')


        }else{
            gradeEight.show()
            gradeTwelve.hide()
            $('#gradeEightText').removeClass('opacity-8')
            $('#gradeTwelveText').addClass('opacity-8')

        }
    });
});


                // storeDataOnLocal('grade', 8);

        Vue.prototype.$http = axios;
        new Vue({
            el: '#app',
            data: {
                studentId: "{{ $studentId }}",
                filterParams: {
                    level: null,
                    subjects: ['Math'],
                    newSubjects: null,
                    tutoring_styles: null,
                    need: null,
                    timezone: null,
                    scheduleMorning: [],
                    scheduleMidday: [],
                    scheduleEvening: []
                },
                allSubjectAreas: {!! json_encode($allSubjectAreas) !!},
                currentSubjectAreas: localStorage.getItem('subjects')?.replace(/^,/, '')?.split(',') || {!! json_encode($studentSubjects) !!},
                rememberSubject: {!! json_encode($rememberSubjects) !!},
                tutors: null,
                calendarLink: "/student/tutor/booking/",
                chatLink: "/chat",
                profileImageLink: "{{ asset('storage/app/public/') }}/",
                tutorProfileLink: "/tutor/profile/",
                deleteSubject: null,
                videoUrl: "{{ asset('storage/app/public') }}/",
                videoThumbNail: "{{ asset('storage/app/public') }}/",
                grade: 8,
                sessionId: "{{$sessionId}}",
                subjects: localStorage.getItem('subjects')?.replace(/^,/, '')?.split(',') || {!! json_encode($studentSubjects) !!},

            },
            computed: {

            },
            mounted() {
                this.fetchData();


            },

            methods: {

                signUpModal: function(value) {
                    $("#signUpModel").modal(value);
                },
                loadSignUpForm:function(studentParent){

                    this.storeDataOnLocal('parent_student', studentParent);
                    $("#signUpFullModel").modal('show');

                },

                fetchData: function() {
                    $("#spinner").css("display", "inline");
                    var vm = this;
                    const obj = this.filterParams;
                    Object.keys(obj).forEach((k) => obj[k] == null && delete obj[k]);
                    this.$http.post("{{ url('api/v1/student/tutorfilter-advanced') }}", {
                        filter: obj
                    }).then(function(response) {

                        // console.log(response.data.data)
                        $("#spinner").css("display", "none");
                        // const result = response.data.data;
                        vm.$set(vm, 'tutors', response.data.data);
                        // alert(JSON.stringify(vm.tutors))

                    }).catch(function(error) {
                        console.log(error)
                    });
                },
                loadVideo: function(videoPath) {
                    $("#loadVideo").modal('show');
                    this.videoUrl += videoPath;
                    this.videoThumbNail += videoPath.split('.')[0] + '_thumb.jpg';
                },

                setDeleteSubject: function(subject) {
                    {{-- this.deleteSubject = subject; --}}
                    this.currentSubjectAreas.pop(subject);
                    {{-- alert(subject); --}}
                    {{-- $("#signUpModel").modal('show'); --}}
                },

                isSelectedSubject: function(subject) {
                    if (this.currentSubjectAreas.includes(subject)) return true;
                    return false;
                },
                subjectFilter: function(e) {
                    const targetName = e.target.name;
                    const targetValue = e.target.value;
                    if (targetName === 'level') {
                        this.filterParams.level = targetValue;
                        this.storeDataOnLocal('level', targetValue);
                    } else if (targetName === 'grade') {
                        this.filterParams.grade = targetValue;
                        this.storeDataOnLocal('grade', targetValue);
                    } else if (targetName === 'need') {
                        this.filterParams.need = targetValue;
                        this.storeDataOnLocal('need', targetValue);
                    } else if (targetName === 'timezone') {
                        this.filterParams.timezone = targetValue;
                        this.storeDataOnLocal('timezone', targetValue);
                    } else if (targetName === 'subjects') {
                        this.storeDataOnLocal('subjects', targetValue, e.target, true);

                        if (e.target.checked) {

                            this.filterParams.subjects.push(targetValue);
                        } else {
                            this.filterParams.subjects.pop(targetValue);
                        }

                        {{-- this.filterParams.subject = targetValue ; --}}

                    } else if (targetName === 'schedule_morning') {
                        this.storeDataOnLocal('schedule_morning', targetValue, e.target, true)

                        if (e.target.checked) {
                            {{-- localStorage.setItem('schedule_morning', targetValue) --}}
                            this.filterParams.scheduleMorning.push(targetValue);
                        } else {
                            {{-- console.log(targetValue); --}}
                            this.filterParams.scheduleMorning.pop(targetValue);
                        }

                    } else if (targetName === 'schedule_midday') {

                        this.storeDataOnLocal('schedule_midday', targetValue, e.target, true)

                        if (e.target.checked) {

                            this.filterParams.scheduleMidday.push(targetValue);
                        } else {
                            this.filterParams.scheduleMidday.pop(targetValue);
                        }

                    } else if (targetName === 'schedule_evening') {
                        this.storeDataOnLocal('schedule_evening', targetValue, e.target, true)

                        if (e.target.checked) {

                            this.filterParams.scheduleEvening.push(targetValue);
                        } else {
                            this.filterParams.scheduleEvening.pop(targetValue);
                        }
                    }
                    {{-- if(e.target.checked){
                         this.rememberSubject.push(e.target.value) ;
                       this.filterParams.isAdd = true;
                    }else{
                        this.filterParams.isAdd = false;
                         this.rememberSubject.pop(e.target.value) ;
                    } --}}

                    this.fetchData();

                    {{-- return true; --}}

                },
                addNewSubject: function(e) {
                    let values = JSON.parse(e.target.value);
                    var vm = this;

                    finalValues = values.map(function(obj) {
                        return obj.value;
                    });

                    {{-- console.log('sd',finalValues); --}}

                    try {
                        finalValues.forEach(item => {
                            if (!this.currentSubjectAreas.includes(item)) this.currentSubjectAreas.push(
                                item);

                        });

                        {{-- const payloads = {subjectArea:this.currentSubjectAreas}; --}}

                    } catch (e) {
                        console.log(e, 'dd');
                    }
                    // this.currentSubjectAreas.push(finalValues);
                    // console.log(finalValues);

                    // this.filterParams.newSubjects = finalValues;
                },

                appendToStorage: function(name, data, isCheck) {
                    var old = localStorage.getItem(name);
                    var finalData = '';
                    if (isCheck) {
                        if (old === null) old = "";
                        if (!old.includes(data)) {
                            finalData = old + ',' + data
                        }
                    } else {


                        finalData = old; //.replace( new RegExp("\\b"+data+"\\b"), "");
                    }

                    // finalData = finalData.slice(1)
                    // if(finalData[0] === ',') finalData = finalData.slice(1);
                    return localStorage.setItem(name, finalData);

                },



                storeDataOnLocal: function(key, value, aa = null, append = false) {
                    console.log(append);
                    if (append) {
                        this.appendToStorage(key, value, aa.checked)
                    } else {
                        localStorage.setItem(key, value);
                    }

                },

                loadWhiteBoard:function(){
                       $('#limnuBoardUrl').addClass('overlay-spinner');


                    this.$http.get("{{ url('api/v1/student/generate-url') }}/" + this.sessionId).then(function(response) {
                        const url = response.data.data;
                        var newUrl = `https://apix.limnu.com/d/draw.html?b=${response.data.boardId}&t=${response.data.token}`
                        const finalUrl = `<iframe src="${newUrl}" title="Tutoring Room"
                                            style="height: 100vh;width: 100%;padding-top: 4.5rem" id="limnu-white-board"
                                            allow="camera;microphone"></iframe>`;

                        $('#limnuBoardUrl').removeClass('overlay-spinner');
                        $('#limnuBoardUrl').html(finalUrl);

                    }).catch(function(error) {
                        console.log(error)
                    });


                }

            } // end of methods

        })

        $("#behaviour-describe").css("display", "none")
        $("#special-needs-describe").css("display", "none")
        $('input[type=radio][name=behaviour]').on('change', function() {

            switch ($(this).val()) {
                case '1':
                    $("#behaviour-describe").css("display", "block")
                    break;
                default:
                    $("#behaviour-describe").css("display", "none")
                    break;
            }
        });


        $('input[type=radio][name=special_needs]').on('change', function() {

            switch ($(this).val()) {
                case '1':
                    $("#special-needs-describe").css("display", "block")
                    break;
                default:
                    $("#special-needs-describe").css("display", "none")
                    break;
            }
        });

        $('input[type=radio][name=schedule_preference_day_time]').on('change', function() {

            switch ($(this).val()) {
                case '1':
                    $("#schedule-preference").css("display", "block")
                    break;
                default:
                    $("#schedule-preference").css("display", "none")
                    break;
            }
        });

        if (document.querySelector('#tagsAdvanced')) {
            var whitelist = [
                @foreach ($subjects as $ats)
                    "{{ $ats }}",
                @endforeach
            ];
            var tagifyAdvanced = new Tagify(document.querySelector('#tagsAdvanced'), {
                enforceWhitelist: true,
                dropdown: {
                    enabled: 1,
                },
                whitelist: document
                    .querySelector('#tagsAdvanced')
                    .value.trim()
                    .split(/\s*,\s*/), // Array of values. stackoverflow.com/a/43375571/104380
            });

            // "remove all tags" button event listener
            {{--  document.querySelector('#removeAllTags').addEventListener('click', tagifyAdvanced.removeAllTags.bind(tagifyAdvanced));  --}}

            // Chainable event listeners
            tagifyAdvanced
                .on('add', onAddTag)
                .on('remove', onRemoveTag)
                .on('input', onInput)
                {{--  .on('edit', onTagEdit)
                .on('invalid', onInvalidTag)
                .on('click', onTagClick)
                .on('focus', onTagifyFocusBlur)
                .on('blur', onTagifyFocusBlur)  --}}
                .on('dropdown:hide dropdown:show', (e) => console.log(e.type))
                {{--  .on('dropdown:select', onDropdownSelect);  --}}


            var mockAjax = (function mockAjax() {
                var timeout;
                return function(duration) {
                    clearTimeout(timeout); // abort last request
                    return new Promise(function(resolve, reject) {
                        timeout = setTimeout(resolve, duration || 700, whitelist);
                    });
                };
            })();

            // tag append callback()

            function onAppendTag(e) {
                console.log(e.detail.tagify.value)
            }

            // tag added callback
            function onAddTag(e) {

                const selectedValues = document.querySelector('#tagsAdvanced').value;

                var final = [...JSON.parse(selectedValues)]
                var valueOnly = []

                final.forEach(item => valueOnly.push(item.value));
                {{-- localStorage.setItem('subjects', valueOnly.join(', '))  --}}
                // tagifyAdvanced.off('add', onAddTag); // exmaple of removing a custom Tagify event
            }

            // // tag remvoed callback
            function onRemoveTag(e) {
                console.log('onRemoveTag:', e.detail, 'tagify instance value:', tagifyAdvanced.value);
            }

            // on character(s) added/removed (user is typing/deleting)
            function onInput(e) {

                // e.detail.tagify.value.forEach(it)
                // console.log('onInput: ', e.detail.tagify.value);
                tagifyAdvanced.settings.whitelist.length = 0; // reset current whitelist
                tagifyAdvanced.loading(true).dropdown.hide.call(tagifyAdvanced); // show the loader animation

                // get new whitelist from a delayed mocked request (Promise)
                mockAjax().then(function(result) {
                    // replace tagify "whitelist" array values with new values
                    // and add back the ones already choses as Tags
                    tagifyAdvanced.settings.whitelist.push(...result,
                        ...
                        tagifyAdvanced.value
                    );

                    // render the suggestions dropdown.
                    tagifyAdvanced.loading(false).dropdown.show.call(tagifyAdvanced, e.detail.value);
                });
            }

        }




        if (localStorage.getItem('grade')) {
            $('input:radio[name="grade"]').filter('[value="' + localStorage.getItem('grade') + '"]').attr('checked', true);
        }

        if (localStorage.getItem('special_needs')) {
            $('input:radio[name="special_needs"]').filter('[value="' + localStorage.getItem('special_needs') + '"]').attr(
                'checked', true);
        }

        if (localStorage.getItem('behaviour')) {
            $('input:radio[name="behaviour"]').filter('[value="' + localStorage.getItem('behaviour') + '"]').attr('checked',
                true);
        }

        if (localStorage.getItem('tutor_preference')) {
            $('input:radio[name="tutor_preference"]').filter('[value="' + localStorage.getItem('tutor_preference') + '"]')
                .attr('checked', true);
        }

        if (localStorage.getItem('schedule_preference_day_time')) {
            $('input:radio[name="schedule_preference_day_time"]').filter('[value="' + localStorage.getItem(
                'schedule_preference_day_time') + '"]').attr('checked', true);
        }

        if (localStorage.getItem('times')) {
            $('#schedule-preference').css('display', 'block')
            $('input:radio[name="times"]').filter('[value="' + localStorage.getItem('times') + '"]').attr('checked', true);
        }



        if (localStorage.getItem('subjects')) {
            localStorage.getItem('subjects').split(',').forEach(item => {
                if (item.length > 0) {
                    $('input:checkbox[name="subjects"]').filter('[value="' + item + '"]').attr('checked', true);
                }
            })

        }



        if (localStorage.getItem('learning_objectives')) {
            localStorage.getItem('learning_objectives').split(',').forEach(item => {
                if (item.length > 0) {
                    $('input:checkbox[name="learning_objectives"]').filter('[value="' + item + '"]').attr('checked',
                        true);
                }
            })

        }

        if (localStorage.getItem('response')) {
            localStorage.getItem('response').split(',').forEach(item => {
                if (item.length > 0) {
                    $('input:checkbox[name="response"]').filter('[value="' + item + '"]').attr('checked', true);
                }
            })

        }


        if (localStorage.getItem('schedule_morning')) {
            localStorage.getItem('schedule_morning').split(',').forEach(item => {
                if (item.length > 0) {
                    $('input:checkbox[name="schedule_morning"]').filter('[value=' + item + ']').attr('checked',
                        true);
                }
            })

        }

        if (localStorage.getItem('schedule_midday')) {
            localStorage.getItem('schedule_midday').split(',').forEach(item => {
                if (item.length > 0) {
                    $('input:checkbox[name="schedule_midday"]').filter('[value=' + item + ']').attr('checked',
                        true);
                }
            })

        }

        if (localStorage.getItem('schedule_evening')) {
            localStorage.getItem('schedule_evening').split(',').forEach(item => {
                if (item.length > 0) {
                    $('input:checkbox[name="schedule_evening"]').filter('[value=' + item + ']').attr('checked',
                        true);
                }
            })

        }

        if (localStorage.getItem('special_needs_describe')) {
            $("#special-needs-describe").css("display", "block")
            $('#special-needs-describe-area').val(localStorage.getItem('special_needs_describe'))
        }

        if (localStorage.getItem('behaviour_describe')) {
            $("#behaviour-describe").css("display", "block")
            $('#behaviour-describe-area').val(localStorage.getItem('behaviour_describe'))
        }

        if (localStorage.getItem('full_name')) {
            $('#student-name').val(localStorage.getItem('full_name'))
        }

        if (localStorage.getItem('email')) {
            $('#student-email').val(localStorage.getItem('email'))
        }

        $('#addressState').on('select2:select', function(e) {
            var data = e.params.data;

            if (data.selected) {
                storeDataOnLocal('timezone', data.Value);
                // alert(localStorage.getItem('timezone'))
            }

        });


        function appendToStorage(name, data, isCheck) {
            var old = localStorage.getItem(name);
            var finalData = '';
            if (isCheck) {
                if (old === null) old = "";
                if (!old.includes(data)) {
                    finalData = old + ',' + data
                }
            } else {


                finalData = old.replace(new RegExp("\\b" + data + "\\b"), "");
            }

            // finalData = finalData.slice(1)
            // if(finalData[0] === ',') finalData = finalData.slice(1);
            localStorage.setItem(name, finalData);

        }




        function storeDataOnLocal(key, value, aa = null, append = false) {
            console.log(value);
            if (append) {
                appendToStorage(key, value, aa.checked)
            } else {
                localStorage.setItem(key, value);
            }

        }

        function dataArray() {
            return [
                'parent_student',
                'grade',
                'subjects',
                'need',
                'schedule_morning',
                'schedule_midday',
                'schedule_evening',
                'name',
                'email',
                'password',
                'timezone'
            ];
        }


        function resetLocalStorage() {
            this.dataArray().forEach(item => {
                localStorage.removeItem(item)
            });
        }

        function saveUserSignUp() {
            $('#registerFormDiv').addClass('overlay-spinner');
            var data = {
                parent_student: localStorage.getItem('parent_student'),
                grade: localStorage.getItem('grade'),
                subjects: localStorage.getItem('subjects'),
                special_needs: localStorage.getItem('need'),
                schedule_morning: localStorage.getItem('schedule_morning'),
                schedule_midday: localStorage.getItem('schedule_midday'),
                schedule_evening: localStorage.getItem('schedule_evening'),
                name: localStorage.getItem('full_name'),
                email: localStorage.getItem('email'),
                password: localStorage.getItem('password'),
                timezone: localStorage.getItem('timezone'),

            };

            $.ajax({
                method: "POST",
                url: "{{ route('api.student.signup') }}",
                data: data,
                dataType: "JSON",
                success: function(result) {
                    resetLocalStorage();
                    localStorage.setItem('student_selected_tab', 0)

                    $('#signup-msg').html(
                        '<div class="alert alert-success" role="alert" id="student-signup-success">Please check your email for activation instructions</div>'
                    );
                    var timer = setTimeout(function() {
                        window.location = "{{ url('/') }}"
                    }, 5000);

                },
                error: function(results) {
                    const response = JSON.parse(results.responseText).data;
                    const msg =
                        `<div class="alert alert-danger"  id="student-signup-error" role="alert">${JSON.stringify(response)}</div>`
                    $("#signup-msg").html(msg)

                    var timer = setTimeout(function() {
                        $('#registerFormDiv').removeClass('overlay-spinner');
                    }, 5000);


                }
            });
        }


