const ELEMENTS = require('./elements');
const DIGITS = '₀₁₂₃₄₅₆₇₈₉';
function normalizeFormula(value) {
  if (typeof value !== 'string') throw new Error('Digite uma fórmula química.');
  if (value.length > 300) throw new Error('Use uma fórmula com até 300 caracteres.');
  return value.trim().replace(/[₀-₉]/g, c => String(DIGITS.indexOf(c)));
}
function displayFormula(formula) {
  const plain = formula.replace(/[₀-₉]/g, c => String(DIGITS.indexOf(c)));
  return plain.replace(/\d+/g, (n, offset, all) => offset === 0 || /[·.]$/.test(all.slice(0, offset)) ? n : n.replace(/\d/g, d => DIGITS[Number(d)]));
}
function calculate(input) {
  const formula = normalizeFormula(input);
  if (!formula) throw new Error('Digite uma fórmula, por exemplo H2O.');
  if (formula.includes('.')) throw new Error('Use o ponto médio · para hidratos. Índices decimais não são aceitos.');
  if (/\s/.test(formula)) throw new Error('Não use espaços dentro da fórmula.');
  if (/[+−\-⁺⁻^]/.test(formula)) throw new Error('Nesta versão, digite a fórmula sem carga: SO4, por exemplo.');
  let i = 0;
  const counts = Object.create(null);
  function number() {
    const start = i;
    while (/[0-9]/.test(formula[i] || '') && i < formula.length) i++;
    if (start === i) return 1;
    const raw = formula.slice(start, i), n = Number(raw);
    if (raw[0] === '0' || !Number.isSafeInteger(n) || n > 1000000) throw new Error('Use índices inteiros entre 1 e 1.000.000, sem zeros à esquerda.');
    return n;
  }
  function add(target, source, factor = 1) {
    for (const [symbol, n] of Object.entries(source)) {
      const value = (target[symbol] || 0) + n * factor;
      if (!Number.isSafeInteger(value) || value > 1000000000) throw new Error('Quantidade de átomos acima do limite de cálculo.');
      target[symbol] = value;
    }
  }
  const closings = {'(': ')', '[': ']'};
  function group(end, depth = 0) {
    if (depth > 20) throw new Error('Use até 20 níveis de agrupamento.');
    const result = Object.create(null);
    while (i < formula.length) {
      const c = formula[i];
      if (c === end) break;
      if (c === ')' || c === ']') throw new Error('Parênteses ou colchetes não correspondem.');
      if (c === '.' || c === '·') { if (end) throw new Error('Separe hidratos fora dos parênteses.'); break; }
      if (closings[c]) {
        i++;
        const inner = group(closings[c], depth + 1);
        if (!Object.keys(inner).length) throw new Error('O agrupamento não pode estar vazio.');
        if (formula[i] !== closings[c]) throw new Error('Feche todos os parênteses e colchetes.');
        i++;
        add(result, inner, number());
      } else if (/[A-Z]/.test(c)) {
        let symbol = formula[i++];
        if (i < formula.length && /[a-z]/.test(formula[i])) symbol += formula[i++];
        if (!ELEMENTS[symbol]) throw new Error(`Elemento não reconhecido: ${symbol}. Confira maiúsculas e minúsculas.`);
        if (ELEMENTS[symbol].mass == null) throw new Error(`${symbol} não possui massa atômica padrão nesta tabela. Isótopos não são calculados nesta versão.`);
        const n = number();
        add(result, {[symbol]: n});
      } else {
        throw new Error(`Símbolo inesperado: ${c}. Use fórmulas como NaCl ou Ca(OH)2.`);
      }
    }
    return result;
  }
  let part = 0;
  while (i < formula.length) {
    const coefficient = number();
    if (part === 0 && coefficient !== 1) throw new Error('Digite uma unidade de fórmula, sem coeficiente inicial: H2O, em vez de 2H2O.');
    // Explicit leading 1 is also not chemical formula notation.
    if (part === 0 && /^[0-9]/.test(formula)) throw new Error('Retire o coeficiente no início da fórmula.');
    const atoms = group();
    if (!Object.keys(atoms).length) throw new Error('Falta uma fórmula após o separador.');
    add(counts, atoms, coefficient);
    if (i === formula.length) break;
    i++;
    part++;
    if (i === formula.length) throw new Error('Falta uma fórmula após o separador.');
  }
  const rows = Object.entries(counts).map(([symbol, count]) => ({symbol, count, ...ELEMENTS[symbol], contribution: count * ELEMENTS[symbol].mass}));
  const mass = rows.reduce((sum, row) => sum + row.contribution, 0);
  return {formula, pretty: displayFormula(formula), mass, atomCount: rows.reduce((s,r) => s+r.count,0), rows: rows.map(row => ({...row, percentage: 100 * row.contribution / mass}))};
}
function formatNumber(n, digits = 3) { return n.toFixed(digits).replace('.', ','); }
module.exports = {calculate, normalizeFormula, displayFormula, formatNumber, ELEMENTS};
