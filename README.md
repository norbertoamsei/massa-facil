# Massa Fácil

Aplicativo que calcula massas moleculares e massas molares a partir de fórmulas de substâncias orgânicas e inorgânicas. PWA em português, para estudantes, professores e público geral.

## Publicação pelo GitHub Pages

Em **Settings → Pages**, selecione:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
- **Save**

Após a publicação, o endereço esperado será **https://norbertoamsei.github.io/massa-facil/**. A existência desse endereço no README não confirma que a publicação foi ativada.

## Instalar no smartphone

Android: abrir no Chrome, menu ⋮, Instalar aplicativo ou Adicionar à tela inicial.

iPhone: abrir no Safari, Compartilhar, Adicionar à Tela de Início. Ativar Abrir como App da Web, quando oferecido.

Aguardar **Pronto para usar offline** no primeiro acesso antes de fechar. Depois, os cálculos funcionam sem rede enquanto o aparelho preservar os arquivos locais. Se limpar os dados do navegador, abrir novamente com internet.

## Recursos

- Índices subscritos automaticamente ao digitar números comuns.
- Coeficientes de hidratação na linha normal: CuSO₄·5H₂O.
- Parênteses, colchetes e grupos aninhados.
- Massa em u e massa molar em g/mol.
- Quantidade de átomos, contribuição e composição percentual por elemento.
- Precisão de exibição ajustável e compartilhamento.
- Histórico apenas da sessão. Sem cadastro, anúncios ou servidor de cálculo.

## Referência científica

Valores centrais da tabela **CIAAW: Abridged Standard Atomic Weights 2024**: https://www.ciaaw.org/abridged-atomic-weights.htm

Para compostos iônicos, a massa em u é a massa da unidade de fórmula. As incertezas e variações isotópicas não são propagadas. Mais casas decimais não significam maior precisão.

São reconhecidos 118 símbolos; 84 têm massa atômica padrão disponível para calcular. Não são aceitos isótopos, cargas, estados físicos ou índices fracionários.

## Código e manutenção

- `docs/`: aplicativo público pronto para GitHub Pages.
- `src/`: interpretação da fórmula e dados dos elementos.
- `scripts/`: geração do cálculo para navegador e verificação do modo offline.
- `tests/`: testes de cálculo.

Requisito para manutenção: Node.js 20.19 ou superior. Não são necessárias dependências externas.

```bash
node --test tests/chemistry.test.js
node scripts/bundle-chemistry.mjs
node scripts/verify-offline.cjs
```

Aumentar a versão do cache em `docs/sw.js` sempre que atualizar qualquer arquivo público. Isso permite que os celulares recebam os arquivos atualizados.

A instalação deve ser conferida em um Android e um iPhone reais. O aplicativo é executado no aparelho; a hospedagem pode manter registros de acesso da infraestrutura.
