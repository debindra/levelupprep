class Wizard {
    get options() {
        return {
            selected: localStorage.getItem('tutor_selected_tab')  || 0,
            cycle: false,
            topNav: true,
            lastEnd: false,
            handleButtonClicks: true,
            onNextClick: null,
            onPrevClick: null,
            onResetClick: null,
        };
    }

    constructor(element, options = {}) {
        if (element === null) {
            console.log('Wizard element is null');
            return;
        }
        this.settings = Object.assign(this.options, options);
        this.element = element;
        this.links = this.element.querySelectorAll('.nav-tabs a');
        this.buttonNext = this.element.querySelector('.btn-next');
        this.buttonPrev = this.element.querySelector('.btn-prev');

        //Education Level
        this.buttonNextEducationLevel1 = this.element.querySelector('.btn-next-education-level-1');
        this.buttonNextEducationLevel2 = this.element.querySelector('.btn-next-education-level-2');
        this.buttonNextEducationLevel3 = this.element.querySelector('.btn-next-education-level-3');
        this.buttonNextEducationLevel4 = this.element.querySelector('.btn-next-education-level-4');

        //Gender
        this.buttonNextGender1 = this.element.querySelector('.btn-next-gender-1');
        this.buttonNextGender2 = this.element.querySelector('.btn-next-gender-2');
        this.buttonNextGender3 = this.element.querySelector('.btn-next-gender-3');
        this.buttonNextGender4 = this.element.querySelector('.btn-next-gender-4');

        //Flexible
        this.buttonNextFlexibleYes = this.element.querySelector('.btn-next-flexible-yes');
        // this.buttonNextFlexibleNo = this.element.querySelector('.btn-next-flexible-no');

        //Tutored Hours

        this.buttonNextTutoredHours1 = this.element.querySelector('.btn-next-tutored-hours-1');
        this.buttonNextTutoredHours2 = this.element.querySelector('.btn-next-tutored-hours-2');
        this.buttonNextTutoredHours3 = this.element.querySelector('.btn-next-tutored-hours-3');
        this.buttonNextTutoredHours4 = this.element.querySelector('.btn-next-tutored-hours-4');
        this.buttonNextTutoredHours5 = this.element.querySelector('.btn-next-tutored-hours-5');

        //Tutored Client

        this.buttonNextTutoredClient1 = this.element.querySelector('.btn-next-tutored-client-1');
        this.buttonNextTutoredClient2 = this.element.querySelector('.btn-next-tutored-client-2');
        this.buttonNextTutoredClient3 = this.element.querySelector('.btn-next-tutored-client-3');
        this.buttonNextTutoredClient4 = this.element.querySelector('.btn-next-tutored-client-4');

        //Tutored Online
        this.buttonNextTutoredNo= this.element.querySelector('.btn-next-tutored-online-no');

        //User Review
        this.buttonNextUserReviewNo= this.element.querySelector('.btn-next-user-review-no');


        //timezone select

        this.timezone = this.element.querySelector('#timezone')

        this.buttonReset = this.element.querySelector('.btn-reset');

        this.currentIndex = this.settings.selected;
        this.totalSteps = this.links.length;

        this._onNextClick = this._onNextClick.bind(this);
        this._onPrevClick = this._onPrevClick.bind(this);
        this._onResetClick = this._onResetClick.bind(this);

        this.steps = [];
        this._init();
        this._hideButton(this.currentIndex);
    }

    _init() {
        this._initSteps();
        this._initTopNav();
        this._addListeners();
        this._showCurrent();
    }

    _initTopNav() {
        if (!this.settings.topNav) {
            this.element.querySelector('.nav-tabs').classList.add('disabled');
        }
    }

    _initSteps() {
        this.steps = [];
        for (let i = 0; i < this.totalSteps; i++) {
            this.links[i].setAttribute('data-index', i);
            this.steps.push({
                link: this.links[i],
                done: false,
            });
        }
    }

    _addListeners() {
        this.buttonNext && this.buttonNext.addEventListener('click', this._onNextClick);
        this.buttonPrev && this.buttonPrev.addEventListener('click', this._onPrevClick);

        this.buttonNextEducationLevel1 && this.buttonNextEducationLevel1.addEventListener('click', this._onNextClick);
        this.buttonNextEducationLevel2 && this.buttonNextEducationLevel2.addEventListener('click', this._onNextClick);
        this.buttonNextEducationLevel3 && this.buttonNextEducationLevel3.addEventListener('click', this._onNextClick);
        this.buttonNextEducationLevel4 && this.buttonNextEducationLevel4.addEventListener('click', this._onNextClick);

        //Gender
        this.buttonNextGender1 && this.buttonNextGender1.addEventListener('click', this._onNextClick);
        this.buttonNextGender2 && this.buttonNextGender2.addEventListener('click', this._onNextClick);
        this.buttonNextGender3 && this.buttonNextGender3.addEventListener('click', this._onNextClick);
        this.buttonNextGender4 && this.buttonNextGender4.addEventListener('click', this._onNextClick);

        //Flexible

        // this.buttonNextFlexibleYes && this.buttonNextFlexibleYes.addEventListener('click', this._onNextClick);
        // this.buttonNextFlexibleNo && this.buttonNextFlexibleNo.addEventListener('click', this._onNextClick);

        //Tutored Hours
        this.buttonNextTutoredHours1 && this.buttonNextTutoredHours1.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredHours2 && this.buttonNextTutoredHours2.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredHours3 && this.buttonNextTutoredHours3.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredHours4 && this.buttonNextTutoredHours4.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredHours5 && this.buttonNextTutoredHours5.addEventListener('click', this._onNextClick);

        //Tutored Client

        this.buttonNextTutoredClient1 && this.buttonNextTutoredClient1.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredClient2 && this.buttonNextTutoredClient2.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredClient3 && this.buttonNextTutoredClient3.addEventListener('click', this._onNextClick);
        this.buttonNextTutoredClient4 && this.buttonNextTutoredClient4.addEventListener('click', this._onNextClick);

        //Tutored Online
        this.buttonNextTutoredNo && this.buttonNextTutoredNo.addEventListener('click', this._onNextClick);

        //User Review
        this.buttonNextUserReviewNo && this.buttonNextUserReviewNo.addEventListener('click', this._onNextClick);

        this.timezone && this.timezone.addEventListener('change', this._onNextClick);

        this.buttonReset && this.buttonReset.addEventListener('click', this._onResetClick);
        for (let i = 0; i < this.totalSteps; i++) {
            this.steps[i].link.addEventListener('click', this._onLinkClick.bind(this));
        }
    }

    _onLinkClick(event) {
        event.preventDefault();
        if (!this.settings.topNav) {
            return;
        }
        this.currentIndex = parseInt(event.currentTarget.getAttribute('data-index'));
        this._showCurrent();
    }

    _onNextClick(event) {
        if (this.settings.handleButtonClicks) {
            this.gotoNext();
        }
        if (typeof this.settings.onNextClick === 'function') {
            this.settings.onNextClick();
        }
    }

    _onPrevClick(event) {
        if (this.settings.handleButtonClicks) {
            this.gotoPrev();
        }
        if (typeof this.settings.onPrevClick === 'function') {
            this.settings.onPrevClick();
        }
    }

    _onResetClick(event) {
        if (this.settings.handleButtonClicks) {
            this.reset();
        }
        if (typeof this.settings.onResetClick === 'function') {
            this.settings.onResetClick();
        }
    }

    _showCurrent() {
        localStorage.setItem('tutor_selected_tab', this.currentIndex);
        this._hideButton(this.currentIndex);
        this._checkButtons();
        this._checkPreviousOnes();
        jQuery(this.steps[this.currentIndex].link).tab('show');
    }

    _hideButton(currentIndex){

        currentIndex = parseInt(currentIndex);
        console.log(currentIndex);
        const hideTabArr = [0,1,8,9,17, 16];
        if(hideTabArr.includes(currentIndex)){
            this.buttonNext && this.buttonNext.classList.add('hide_div');
             this.buttonPrev && this.buttonPrev.classList.remove('hide_div');
        }else{
            this.buttonNext && this.buttonNext.classList.remove('hide_div');
        }

        if(currentIndex === 0){
            this.buttonPrev && this.buttonPrev.classList.add('hide_div');
        }
        // else if (currentIndex === 1 || currentIndex === 8 || currentIndex === 9 )  {
        //     // this.buttonPrev && this.buttonPrev.classList.remove('hide_div');

        //     this.buttonNext && this.buttonNext.classList.add('hide_div');

        // }else if( currentIndex === 16  || currentIndex === 17){
        //     this.buttonNext && this.buttonNext.classList.add('hide_div');
        // }
        // else {
        //     this.buttonNext && this.buttonNext.classList.remove('hide_div');
        //     // this.buttonPrev && this.buttonPrev.classList.remove('hide_div');
        // }

        currentIndex === 10 &&  this.buttonNextTutoredNo && this.buttonNextTutoredNo.addEventListener('click', function () {
            this.buttonNext && this.buttonNext.classList.add('hide_div');
            // this.buttonPrev && this.buttonPrev.classList.add('hide_div');
        });

        currentIndex === 16 &&  this.timezone && this.timezone.addEventListener('click', function () {
            this.buttonNext && this.buttonNext.classList.add('hide_div');
            // this.buttonPrev && this.buttonPrev.classList.add('hide_div');
        });
        currentIndex === 4 &&  this.buttonNextUserReviewNo && this.buttonNextUserReviewNo.addEventListener('click', function () {
            this.buttonNext && this.buttonNext.classList.add('hide_div');
        });

    }

    _checkPreviousOnes() {
        var prevIndex = this.currentIndex - 1;
        for (let i = 0; i < this.totalSteps; i++) {
            if (i <= prevIndex) {
                this.steps[i].done = true;
                this.steps[i].link.classList.add('done');
            }
        }
    }

    _uncheckAll() {
        for (let i = 0; i < this.totalSteps; i++) {
            this.steps[i].done = false;
            this.steps[i].link.classList.remove('done');
        }
    }

    _checkButtons() {
        if (!this.settings.cycle) {
            if (this.currentIndex >= this.totalSteps - 1) {
                this.buttonNext && this.buttonNext.classList.add('disabled');
                this.buttonNext2 && this.buttonNext2.classList.add('disabled');
                // this.buttonNext3 && this.buttonNext3.classList.add('disabled');
                // this.buttonNext4 && this.buttonNext4.classList.add('disabled');
            } else {
                this.buttonNext && this.buttonNext.classList.remove('disabled');
                this.buttonNext2 && this.buttonNext2.classList.remove('disabled');
                // this.buttonNext3 && this.buttonNext3.classList.remove('disabled');
                // this.buttonNext4 && this.buttonNext4.classList.remove('disabled');s
            }
            if (this.currentIndex <= 0) {
                this.buttonPrev && this.buttonPrev.classList.add('disabled');
            } else {
                this.buttonPrev && this.buttonPrev.classList.remove('disabled');
            }
        }
    }

    _disableButtons() {
        if (this.buttonNext) {
            this.buttonNext.removeEventListener('click', this._onNextClick);
            this.buttonNext.classList.add('disabled');
        }

        if (this.buttonNext2) {
            this.buttonNext2.removeEventListener('click', this._onNextClick);
            this.buttonNext2.classList.add('disabled');
        }

        if (this.buttonNext3) {
            this.buttonNext3.removeEventListener('click', this._onNextClick);
            this.buttonNext3.classList.add('disabled');
        }

        // if (this.buttonNext4) {
        //     this.buttonNext4.removeEventListener('click', this._onNextClick);
        //     this.buttonNext4.classList.add('disabled');
        // }


        // if (this.buttonPrev) {
        //     this.buttonPrev.removeEventListener('click', this._onPrevClick);
        //     this.buttonPrev.classList.add('disabled');
        // }

        if (this.buttonReset) {
            this.buttonReset.removeEventListener('click', this._onResetClick);
            this.buttonReset.classList.add('disabled');
        }
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getTotalSteps() {
        return this.totalSteps;
    }

    getCurrentContent() {
        return this.element.querySelectorAll('.tab-pane')[this.currentIndex];
    }

    getContentByIndex(index) {
        this.element.querySelectorAll('.tab-pane')[index];
    }

    gotoIndex(index) {
        if (index >= this.totalSteps || index < 0) {
            console.error('Index out of bounds');
            return;
        }
        this.currentIndex = index;
        this._showCurrent();
    }

    gotoNext() {
        this.currentIndex++;
        if (this.currentIndex >= this.totalSteps) {
            if (this.settings.cycle) {
                this.currentIndex = 0;
            } else {
                this.currentIndex--;
            }
        }
        this._showCurrent();
        if (this.settings.lastEnd && this.currentIndex === this.totalSteps - 1) {
            this._disableButtons();
        }
    }

    gotoPrev() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            if (this.settings.cycle) {
                this.currentIndex = this.totalSteps - 1;
            } else {
                this.currentIndex++;
            }
        }
        this._showCurrent();
    }

    reset() {
        this._initSteps();
        this.currentIndex = this.settings.selected;
        this._showCurrent();
        this._uncheckAll();
    }
}
