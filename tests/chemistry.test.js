const {test} = require('node:test');
const assert = require('node:assert/strict');
const {calculate, ELEMENTS, displayFormula} = require('../src/chemistry');
for (const [formula, expected, atoms] of [
  ['H2O',18.015,3],['CO2',44.009,3],['NaCl',58.44,2],['C6H12O6',180.156,24],
  ['Ca(OH)2',74.092,5],['Al2(SO4)3',342.132,17],['CuSO4·5H2O',249.677,21],
  ['K4[Fe(CN)6]',368.345,17],['H₂O',18.015,3],['CH3COOH',60.052,8],
  ['(NH4)2SO4',132.134,15],['MgCl2·6H2O',203.295,21],['Fe',55.845,1],
  ['Zr',91.222,1],['UO2',270.028,3],[' H2O ',18.015,3],['H2O·H2O',36.03,6]
]) test(formula, () => { const r=calculate(formula); assert.ok(Math.abs(r.mass-expected)<1e-8); assert.equal(r.atomCount,atoms); assert.ok(Math.abs(r.rows.reduce((s,x)=>s+x.percentage,0)-100)<1e-8); });
for (const formula of ['', 'h2o', 'H0', 'H02', 'H1.5O', 'Ca(OH', 'Ca[OH)2', '()', 'Xx2', 'H2O·', '2H2O', '1H2O', 'H2 O','SO4^2-', 'H2O+', 'Tc', 'Og', '[H·O]', 'H1000001', 'H2O··H2O','123C','0H2O','H2O·0H2O','H'.repeat(301),'('.repeat(22)+'H'+')'.repeat(22)]) test('Rejeita '+formula.slice(0,40), () => assert.throws(() => calculate(formula)));
test('Tabela completa e massas padrão', () => { assert.equal(Object.keys(ELEMENTS).length,118); assert.equal(Object.values(ELEMENTS).filter(x=>x.mass!==null).length,84); });
test('Subscritos e coeficiente do hidrato',()=>assert.equal(displayFormula('CuSO4·5H2O'),'CuSO₄·5H₂O'));
test('Overflow de grupos',()=>assert.throws(()=>calculate('(H1000000)1000000')));
