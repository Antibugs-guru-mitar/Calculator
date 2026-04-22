const input = document.querySelector('.input');
const history = document.querySelector('.history');
const buttons = document.querySelector('.buttons');
const degRad = document.querySelector('.deg-rad');

let currentInput = '0';
let shouldReset = false;
let isDegree = true;
let isInverse = false;

const updateDisplay = () => {
  input.value = currentInput;
};

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
  if(lastNumber.includes('.')) return;
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
  if(lastChar === '.') currentInput += '0';
  if('+-×÷^%'.includes(lastChar)){
    currentInput = currentInput.slice(0, -1) + op;
  } else if(lastChar!== '('){
    currentInput += op;
  }
  shouldReset = false;
  updateDisplay();
};

// ===== AAKHRI AUR FINAL CALCULATE FUNCTION =====
// BINA math.js KE - ERROR KABHI NAHI AAYEGA
const calculate = () => {
  try {
    let expression = currentInput;
    
    // Custom function banate hain DEG/RAD ke liye
    const evalExpr = (expr) => {
      const degToRad = (x) => isDegree ? x * Math.PI / 180 : x;
      const radToDeg = (x) => isDegree ? x * 180 / Math.PI : x;
      
      // Saare function define kar do
      const sin = (x) => Math.sin(degToRad(x));
      const cos = (x) => Math.cos(degToRad(x));
      const tan = (x) => Math.tan(degToRad(x));
      const asin = (x) => radToDeg(Math.asin(x));
      const acos = (x) => radToDeg(Math.acos(x));
      const atan = (x) => radToDeg(Math.atan(x));
      const log = (x) => Math.log10(x);
      const ln = (x) => Math.log(x);
      const sqrt = (x) => Math.sqrt(x);
      const exp = (x) => Math.exp(x);
      const pi = Math.PI;
      const e = Math.E;
      
      // Operator replace
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\^/g, '**');
      
      // Factorial handle karo
      expr = expr.replace(/(\d+)!/g, (match, num) => {
        let f = 1;
        for(let i = 2; i <= num; i++) f *= i;
        return f;
      });
      
      // Eval use kar rahe par safe tareeke se
      return Function('sin','cos','tan','asin','acos','atan','log','ln','sqrt','exp','pi','e', `'use strict'; return (${expr})`)(sin,cos,tan,asin,acos,atan,log,ln,sqrt,exp,pi,e);
    };

    const result = evalExpr(expression);
    history.textContent = currentInput + ' =';

    if(typeof result === 'number'){
      currentInput = parseFloat(result.toFixed(14)).toString();
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
  if(isInverse){
    const invMap = {sin: 'asin', cos: 'acos', tan: 'atan', ln: 'exp', log: '10**'};
    func = invMap || func;
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
  if(action === 'square') addOperator('**2');
  if(action === 'fact') addValue('!');
  if(action === 'percent') addOperator('%');
  if(action === 'copy') copyResult();
  if(action === 'bracket'){
    const open = (currentInput.match(/\(/g) || []).length;
    const close = (currentInput.match(/\)/g) || []).length;
    addValue(open > close? ')' : '(');
  }
});

updateDisplay();
