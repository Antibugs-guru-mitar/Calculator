const input = document.querySelector('.input');
const history = document.querySelector('.history');
const buttons = document.querySelector('.buttons');
const degRad = document.querySelector('.deg-rad');

let currentInput = '0';
let shouldReset = false;
let isDegree = true;
let isInverse = false;

// DISPLAY UPDATE
const updateDisplay = () => {
  input.value = currentInput;
};

// DOUBLE DECIMAL KA PAKKA ILAJ - RULE: 2.11 YES, 2.1.11 NO
const getLastNumber = () => {
  const parts = currentInput.split(/[\+\−\×\÷\^\%\(\)]/);
  return parts[parts.length - 1] || '';
};

const addDecimal = () => {
  if(shouldReset){
    currentInput = '0.';
    shouldReset = false;
    updateDisplay();
    return;
  }

  const lastNumber = getLastNumber();
  const lastChar = currentInput.slice(-1);

  // RULE 1: Agar last number mein. pehle se hai to BLOCK
  if(lastNumber.includes('.')){
    return; // 2.1.11 KABHI NAHI BANEGA
  }

  // RULE 2: Agar operator ya ( ke baad hai to 0. lagao
  if('+-×÷^%('.includes(lastChar) || currentInput === '0'){
    currentInput += currentInput === '0'? '.' : '0.';
  } else {
    currentInput += '.';
  }

  updateDisplay();
};

const addValue = (val) => {
  if(currentInput === '0' || shouldReset){
    currentInput = val;
    shouldReset = false;
  } else {
    currentInput += val;
  }
  updateDisplay();
};

const addOperator = (op) => {
  const lastChar = currentInput.slice(-1);

  // Agar last mein. hai to 0 add kar do: 5. + becomes 5.0 +
  if(lastChar === '.'){
    currentInput += '0';
  }

  // Double operator replace
  if('+-×÷^%'.includes(lastChar)){
    currentInput = currentInput.slice(0, -1) + op;
  } else if(lastChar!== '('){
    currentInput += op;
  }

  shouldReset = false;
  updateDisplay();
};

// CALCULATION - YAHAN SIRF ISKO BADLA HAI MITAR 🔥 ERROR KHATAM
const calculate = () => {
  try {
    let expression = currentInput.replace(/(\d+)\.$/, '$1.0');
    expression = expression.replace(/\.$/, '.0');

    expression = expression
  .replace(/×/g, '*')
  .replace(/÷/g, '/')
  .replace(/−/g, '-')
  .replace(/π/g, 'pi')
  .replace(/√/g, 'sqrt')
  .replace(/xʸ/g, '^');

    // ===== SIRF YE HISSA BADLA HAI - ERROR-FREE ILAJ =====
    const scope = {
      pi: Math.PI,
      e: Math.E
    };

    // DEG mode ka seedha formula - math.import hata diya
    if(isDegree){
      expression = expression
    .replace(/sin\(/g, 'sin((pi/180)*')
    .replace(/cos\(/g, 'cos((pi/180)*')
    .replace(/tan\(/g, 'tan((pi/180)*')
    .replace(/asin\(/g, '(180/pi)*asin(')
    .replace(/acos\(/g, '(180/pi)*acos(')
    .replace(/atan\(/g, '(180/pi)*atan(');
    }
    // ===== ILAJ KHATAM =====

    const result = math.evaluate(expression, scope);
    history.textContent = currentInput + ' =';

    if(typeof result === 'number'){
      currentInput = math.format(result, {precision: 14, notation: 'fixed'})
    .replace(/\.?0+$/, '');
      if(currentInput === '-0') currentInput = '0';
    } else {
      currentInput = String(result);
    }

    shouldReset = true;
    updateDisplay();
  } catch(err) {
    currentInput = 'Error';
    shouldReset = true;
    updateDisplay();
    setTimeout(() => {
      currentInput = '0';
      history.textContent = '';
      updateDisplay();
    }, 1500);
  }
};

const clearAll = () => {
  currentInput = '0';
  history.textContent = '';
  updateDisplay();
};

const backspace = () => {
  if(currentInput.length > 1 &&!shouldReset){
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  shouldReset = false;
  updateDisplay();
};

const addFunction = (func) => {
  if(shouldReset){
    currentInput = '0';
    shouldReset = false;
  }
  if(currentInput === '0') currentInput = '';

  // INV mode ke liye
  if(isInverse){
    const invMap = {sin: 'asin', cos: 'acos', tan: 'atan', ln: 'exp', log: '10^'};
    func = invMap[func] || func;
  }

  currentInput += func + '(';
  updateDisplay();
};

const addConstant = (constant) => {
  if(currentInput === '0' || shouldReset){
    currentInput = constant;
    shouldReset = false;
  } else {
    currentInput += constant;
  }
  updateDisplay();
};

const toggleMode = () => {
  isDegree =!isDegree;
  degRad.textContent = isDegree? 'DEG' : 'RAD';
  buttons.querySelector('[data-action="mode"]').textContent = isDegree? 'RAD' : 'DEG';
};

const toggleInverse = () => {
  isInverse =!isInverse;
  const btn = buttons.querySelector('[data-action="inv"]');
  btn.style.background = isInverse? '#FF3B30' : '#1DB954';
};

const copyResult = () => {
  navigator.clipboard.writeText(input.value);
  history.textContent = 'Copied!';
  setTimeout(() => history.textContent = '', 1000);
};

// SAB BUTTON KA CONTROL
buttons.addEventListener('click', (e) => {
  if(!e.target.matches('button')) return;

  const btn = e.target;
  const value = btn.dataset.value;
  const action = btn.dataset.action;

  if(value) addValue(value);
  if(action === 'decimal') addDecimal();
  if(action === 'operator') addOperator(btn.textContent);
  if(action === 'equals') calculate();
  if(action === 'clear') clearAll();
  if(action === 'backspace') backspace();
  if(action === 'mode') toggleMode();
  if(action === 'inv') toggleInverse();
  if(action === 'func') addFunction(btn.textContent);
  if(action === 'const') addConstant(btn.textContent);
  if(action === 'power') addOperator('^');
  if(action === 'square') addOperator('^2');
  if(action === 'fact') addValue('!');
  if(action === 'percent') addOperator('%');
  if(action === 'copy') copyResult();
  if(action === 'bracket'){
    const open = (currentInput.match(/\(/g) || []).length;
    const close = (currentInput.match(/\)/g) || []).length;
    addValue(open > close? ')' : '(');
  }
});

// INIT
updateDisplay();
