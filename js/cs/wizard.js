
class Wizard {
    get options() {
        return {
            selected: parseInt(localStorage.getItem('student_selected_tab'))  || 0,
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
        this.buttonNext2 = this.element.querySelector('.btn-next-2');
        this.buttonNext3 = this.element.querySelector('.btn-next-3');
        this.buttonReset = this.element.querySelector('.btn-reset');

        this.currentIndex = this.settings.selected;
        this.totalSteps = this.links.length;

        this._onNextClick = this._onNextClick.bind(this);
        this._onPrevClick = this._onPrevClick.bind(this);
        this._onResetClick = this._onResetClick.bind(this);

        this.steps = [];
        this._init();
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
        this.buttonNext2 && this.buttonNext2.addEventListener('click', this._onNextClick);
        this.buttonNext3 && this.buttonNext3.addEventListener('click', this._onNextClick);
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
        const currentIndexValue = parseInt(this.currentIndex);
        localStorage.setItem('student_selected_tab', this.currentIndex);
        
        if (currentIndexValue === 0) {
            this.buttonPrev && this.buttonPrev.classList.add('hide_div');
            this.buttonPrev && this.buttonNext.classList.add('hide_div');
        }else if( currentIndexValue === 5){
            this.buttonNext && this.buttonNext.classList.add('hide_div');
            
            this.buttonPrev && this.buttonPrev.classList.remove('disabled');
        }
        else {
             this.buttonPrev && this.buttonPrev.classList.remove('disabled');
            this.buttonNext && this.buttonNext.classList.remove('hide_div');
            this.buttonPrev && this.buttonPrev.classList.remove('hide_div');
        }

        this._checkButtons();
        this._checkPreviousOnes();
        jQuery(this.steps[this.currentIndex].link).tab('show');
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
                this.buttonNext3 && this.buttonNext3.classList.add('disabled');
                // this.buttonNext4 && this.buttonNext4.classList.add('disabled');
            } else {
                this.buttonNext && this.buttonNext.classList.remove('disabled');
                this.buttonNext2 && this.buttonNext2.classList.remove('disabled');
                this.buttonNext3 && this.buttonNext3.classList.remove('disabled');
                // this.buttonNext4 && this.buttonNext4.classList.remove('disabled');
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

        // if (this.buttonNext2) {
        //     this.buttonNext2.removeEventListener('click', this._onNextClick);
        //     this.buttonNext2.classList.add('disabled');
        // }

        // if (this.buttonNext3) {
        //     this.buttonNext3.removeEventListener('click', this._onNextClick);
        //     this.buttonNext3.classList.add('disabled');
        // }

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
