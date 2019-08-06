// supported cards
const supportedCards = {
  visa, mastercard
};

// countries array
const countries = [
  {
    code: "US",
    currency: "USD",
    country: 'United States'
  },
  {
    code: "NG",
    currency: "NGN",
    country: 'Nigeria'
  },
  {
    code: 'KE',
    currency: 'KES',
    country: 'Kenya'
  },
  {
    code: 'UG',
    currency: 'UGX',
    country: 'Uganda'
  },
  {
    code: 'RW',
    currency: 'RWF',
    country: 'Rwanda'
  },
  {
    code: 'TZ',
    currency: 'TZS',
    country: 'Tanzania'
  },
  {
    code: 'ZA',
    currency: 'ZAR',
    country: 'South Africa'
  },
  {
    code: 'CM',
    currency: 'XAF',
    country: 'Cameroon'
  },
  {
    code: 'GH',
    currency: 'GHS',
    country: 'Ghana'
  }
];

// appState
const appState = {};

// format money according to country currency
const formatAsMoney = (amount, buyerCountry) => {
  const country = countries.find((country) => {
    return country.country === buyerCountry;
  });

  if(country) {
    return amount.toLocaleString(`en-${country.code}`, {
      style: 'currency',
      currency: country.currency
    });
  } else {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }
};

// remove or add strikethrough for invalid or valid entries
const flagIfInvalid = (field, isValid) => {
  if (isValid) {
    return field.classList.remove('is-invalid');
  }
return field.classList.add('is-invalid');
};

// expiry date format
const expiryDateFormatIsValid = (target) => {
  if (target.value.match(/^(\d|(0|1)[1-9])\/\d{2}$/)) {
    return true;
  }
return false;
};

// card type detector
const detectCardType = ({ target }) => {
  const card = document.querySelector('[data-credit-card]');
  const logo = document.querySelector('[data-card-type]');
  if (target.value.startsWith(parseInt(4))) {
    card.classList.remove('is-mastercard');
    card.classList.add('is-visa');
    logo.src = supportedCards.visa;
    return 'is-visa';
  } else if (target.value.startsWith(parseInt(5))) {
    card.classList.remove('is-visa');
    card.classList.add('is-mastercard');
    logo.src = supportedCards.mastercard;
    return 'is-mastercard';
  }
};

// card expiry date validation
const validateCardExpiryDate = ({target}) => {
  const isMatch = expiryDateFormatIsValid(target);
  const edited = '01/'+target.value;
  const inputDate = new Date(edited);
  const fullDateToday = new Date();
  const checkMonth = (Number(target.value.split('/')[0])-1)>fullDateToday.getMonth();
  const checkYear = inputDate.getYear()>fullDateToday.getYear();
  const greater = () => {
    if (inputDate.getYear()===fullDateToday.getYear()){
      if (checkMonth) {
        return true;
      } else {
        return false;
      }
    } else if (checkYear) {
      return true;
    } else {
      return false;
    }
  };

  if ((greater()) && isMatch) {
    flagIfInvalid(target, true);
    return true;
  } else {
    flagIfInvalid(target, false);
    return false;
  }
};

// card holder's name validation
const validateCardHolderName = ({target}) => {
  const names = target.value;
  const valid = names.match(/^[a-zA-Z]{3,30} +[a-zA-Z]{3,30}$/)
  if (names && valid) {
    flagIfInvalid(target, true);
    return true;
  }
  flagIfInvalid(target, false);
  return false;
};

// luhn validate card number function
const validateWithLuhn = (digits) => {
  let sum = 0;
  if (digits.length==16) {
    for (let i=digits.length-2; i>=0; i=i-2) {
      if (Number.isInteger(digits[i]) && digits[i]>=0) {
        digits[i] = digits[i]*2;
        if (digits[i]>9) {
          digits[i] = digits[i]-9;
        }
        sum = sum + digits[i] + digits[i+1];
      }		  
    }
  if (sum%10==0)
    return true;
  }
  return false;
};

// card number validation
const validateCardNumber = () => {
  const digitsArr = Array.from(document.querySelectorAll('[data-cc-digits] input'));
  const strDigit = digitsArr.reduce((totalDigits, currentSet) => {
    return totalDigits + currentSet.value
  }, '');
  const digits = strDigit.split('').map(digit => parseInt(digit, 10));
  const isValidNumber = validateWithLuhn(digits);
  const inputDigits = document.querySelector('[data-cc-digits]');
  if (isValidNumber) {
    inputDigits.classList.remove('is-invalid');
  } else {
    inputDigits.classList.add('is-invalid');
  }
  return isValidNumber;
};

// ui event listeners
const uiCanInteract = () => {
  document.querySelector('[data-cc-digits] input:nth-child(1)')
  .addEventListener('blur', detectCardType);
  document.querySelector('[data-cc-info] input:nth-child(1)')
  .addEventListener('blur', validateCardHolderName);
  document.querySelector('[data-cc-info] input:nth-child(2)')
  .addEventListener('blur', validateCardExpiryDate);
  document.querySelector('[data-pay-btn]')
  .addEventListener('click', validateCardNumber);
  document.querySelector('[data-cc-digits] input:nth-child(1)').focus();
};

// display cart total
const displayCartTotal = ({results}) => {
  const [data] = results;
  const { itemsInCart, buyerCountry } = data;

  appState.items = itemsInCart;
  appState.country = buyerCountry;
  appState.bill = itemsInCart.reduce((total, item) => {
    return total + (item.qty * item.price);
  }, 0);
  appState.billFormatted = formatAsMoney(appState.bill, appState.country);
  
  document.querySelector('[data-bill]').textContent = appState.billFormatted;
  uiCanInteract();
};

// http request to api endpoint
const fetchBill = () => {
  const api = "https://randomapi.com/api/006b08a801d82d0c9824dcfdfdfa3b3c";
  fetch(api)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    displayCartTotal(data);
  })
  .catch((err) => {
    console.log(err);
  })
};

// start App
const startApp = () => {
  fetchBill();
};

startApp();
