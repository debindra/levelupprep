/**
 *
 * InputMaskudent
 *
 * Interface.Forms.InputMask page content scripts. Initialized from scripts.js file.
 *
 *
 */

class InputMask {
  constructor() {
    if (typeof IMask === 'undefined') {
      console.log('IMask is undefined!');
      return;
    }

    // Initialization of the page plugins
    this._initMaskDate();
    this._initMaskDateChars();
    this._initMaskHour();
    this._initMaskPhoneInternational();
    this._initMaskPhoneDomestic();
    this._initMaskNumber();
    this._initMaskInMask();
    this._initCreditCardMask();
    this._initMaskComplex();
    this._initMaskFunction();
    this._initMaskValueLog();
    this._initMaskTopLabel();
    this._initMaskFilled();
    this._initCvc();
    this._initYearMonth();
  }


  _initYearMonth(){
        if (document.querySelector('#monthYear') !== null) {
      IMask(document.querySelector('#monthYear'), {
        overwrite: true,
        autofix: true,
        mask: 'MM/YY',
        lazy: false,
        blocks: {
          YY: {
            mask: IMask.MaskedRange,
            placeholderChar: 'Y',
            from: 22,
            to: 99,
            maxLength: 2,
          },
          MM: {
            mask: IMask.MaskedRange,
            placeholderChar: 'M',
            from: 1,
            to: 12,
            maxLength: 2,
          },
        },
      });
    }
  }

  _initCvc(){
        if (document.querySelector('#cardCvc') !== null) {
      IMask(document.querySelector('#cardCvc'), {
        // overwrite: true,
        // autofix: false,
        mask: 'CVCX',
        lazy: false,
        blocks: {
            C: {
                mask: '0',
                placeholderChar: 'C',
                from: 0,
                to: 9,
                maxLength: 1,
            },
            V: {
                mask: '0',
                placeholderChar: 'V',
                from: 0,
                to: 9,
                maxLength: 1,
            },
            C: {
                mask: '0',
                placeholderChar: 'C',
                from: 0,
                to: 9,
                maxLength: 1,
            },
            X: {
                mask: '0',
                placeholderChar: ' ',
                from: 0,
                to: 9,
                maxLength: 1,
            }
        }
      });
    }

  }

  // Date masks
  _initMaskDate() {
    // Empty date mask
    if (document.querySelector('#dateMask') !== null) {
      IMask(document.querySelector('#dateMask'), {
        mask: "Date",
        min: new Date(1900, 0, 1),
        max: new Date(2020, 0, 1),
        lazy: false,
      });
    }

    // Filled date mask
    if (document.querySelector('#dateInitialMask') !== null) {
      IMask(document.querySelector('#dateInitialMask'), {
        mask: Date,
        min: new Date(1900, 0, 1),
        max: new Date(2020, 0, 1),
        lazy: false,
      });
    }
  }

  // Date mask with characters
  _initMaskDateChars() {
    if (document.querySelector('#dateCharMask') !== null) {
      IMask(document.querySelector('#dateCharMask'), {
        mask: Date,
        lazy: false,
        autofix: true,
        blocks: {
          d: {mask: IMask.MaskedRange, placeholderChar: 'm', from: 1, to: 12, maxLength: 2},
          m: {mask: IMask.MaskedRange, placeholderChar: 'd', from: 1, to: 31, maxLength: 2},
          Y: {mask: IMask.MaskedRange, placeholderChar: 'y', from: 1900, to: new Date().getFullYear(), maxLength: 4},
        },
      });
    }
  }

  // Hour mask
  _initMaskHour() {
    // 24 hour format
    if (document.querySelector('#hourMask') !== null) {
      IMask(document.querySelector('#hourMask'), {
        overwrite: true,
        autofix: true,
        mask: 'HH:MM',
        lazy: false,
        blocks: {
          HH: {
            mask: IMask.MaskedRange,
            placeholderChar: '_',
            from: 0,
            to: 23,
            maxLength: 2,
          },
          MM: {
            mask: IMask.MaskedRange,
            placeholderChar: '_',
            from: 0,
            to: 59,
            maxLength: 2,
          },
        },
      });
    }

    // 12 hour format
    if (document.querySelector('#hourMaskAMPM') !== null) {
      IMask(document.querySelector('#hourMaskAMPM'), {
        overwrite: true,
        autofix: true,
        mask: 'HH:MM XX',
        lazy: false,
        blocks: {
          HH: {
            mask: IMask.MaskedRange,
            placeholderChar: '_',
            from: 1,
            to: 12,
            maxLength: 2,
          },
          MM: {
            mask: IMask.MaskedRange,
            placeholderChar: '_',
            from: 0,
            to: 59,
            maxLength: 2,
          },
          XX: {
            mask: IMask.MaskedEnum,
            placeholderChar: '_',
            enum: ['AM', 'PM', 'am', 'pm', 'Am', 'Pm'],
          },
        },
      });
    }
  }

  // Phone with country code
  _initMaskPhoneInternational() {
    if (document.querySelector('#hourInternationalMask') !== null) {
      IMask(document.querySelector('#hourInternationalMask'), {
        mask: '+{46}(000) 000-00-00',
        lazy: false,
      });
    }
  }

  // Standard 10 digit phone
  _initMaskPhoneDomestic() {
    if (document.querySelector('#hourDomesticMask') !== null) {
      IMask(document.querySelector('#hourDomesticMask'), {
        mask: '(000) 000-00-00',
        lazy: false,
      });
    }
  }

  // Number masks
  _initMaskNumber() {
    // Standard number mask
    if (document.querySelector('#maskNumber') !== null) {
      IMask(document.querySelector('#maskNumber'), {
        mask: Number,
      });
    }

    // Large number mask
    if (document.querySelector('#maskNumberLarge') !== null) {
      IMask(document.querySelector('#maskNumberLarge'), {
        mask: Number,
        min: -10000,
        max: 10000,
        thousandsSeparator: '.',
      });
    }

    // Small number mask
    if (document.querySelector('#maskNumberSmall') !== null) {
      IMask(document.querySelector('#maskNumberSmall'), {
        mask: Number,
        min: 0,
        max: 9,
      });
    }
  }

  // Number and currency masks
  _initMaskInMask() {
    if (document.querySelector('#maskCurrency') !== null) {
      IMask(document.querySelector('#maskCurrency'), {
        mask: '$ num',
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: '.',
          },
        },
      });
    }
  }

  // 16 digits credit card mask
  _initCreditCardMask() {
    if (document.querySelector('#maskCreditCard') !== null) {
      IMask(document.querySelector('#maskCreditCard'), {
          overwrite: true,
          autofix: true,
        mask: 'M M M M',

          blocks: {
              M:{
                  mask: '0000',
                  from: 0,
                  to: 9999,
                  maxLength: 1,
                  placeholderChar: '1'
              },
          },
        lazy: false,
      });
    }
  }

  // Complex fill in the blanks example
  _initMaskComplex() {
    if (document.querySelector('#maskComplex') !== null) {
      IMask(document.querySelector('#maskComplex'), {
        mask: 'Ple\\ase fill ye\\ar 19YY, month MM \\and v\\alue VL',
        lazy: false,
        blocks: {
          YY: {
            mask: '00',
          },
          MM: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
          },
          VL: {
            mask: IMask.MaskedEnum,
            enum: ['TV', 'HD', 'VR'],
          },
        },
      });
    }
  }

  // Growing values with a function
  _initMaskFunction() {
    if (document.querySelector('#maskFunction') !== null) {
      IMask(document.querySelector('#maskFunction'), {
        mask: function (value) {
          return (
            /^\d*$/.test(value) &&
            value.split('').every(function (ch, i) {
              var prevCh = value[i - 1];
              return !prevCh || prevCh < ch;
            })
          );
        },
      });
    }
  }

  // Top label input mask
  _initMaskTopLabel() {
    if (document.querySelector('#maskTopLabel') !== null) {
      IMask(document.querySelector('#maskTopLabel'), {
        mask: Date,
        min: new Date(1900, 0, 1),
        max: new Date(2020, 0, 1),
        lazy: false,
      });
    }
  }

  // Filled input mask
  _initMaskFilled() {
    if (document.querySelector('#maskFilled') !== null) {
      IMask(document.querySelector('#maskFilled'), {
        mask: Date,
        min: new Date(1900, 0, 1),
        max: new Date(2020, 0, 1),
        lazy: false,
      });
    }
  }

  // Filled input mask
  _initMaskFilled() {
    if (document.querySelector('#maskFloatingLabel') !== null) {
      IMask(document.querySelector('#maskFloatingLabel'), {
        mask: Date,
        min: new Date(1900, 0, 1),
        max: new Date(2020, 0, 1),
        lazy: false,
      });
    }
  }

  // Logging values with and without mask
  _initMaskValueLog() {
    if (document.getElementById('maskGetValue')) {
      const mask = IMask(document.getElementById('maskGetValue'), {
        mask: '(000) 000-00-00',
        lazy: false,
      });

      document.getElementById('maskGetValue').setAttribute('mask', mask);

      document.getElementById('logButton').addEventListener('click', (event) => {
        console.log(mask.value);
      });

      document.getElementById('logUnmaskedButton').addEventListener('click', (event) => {
        console.log(mask.unmaskedValue);
      });
    }
  }
}
