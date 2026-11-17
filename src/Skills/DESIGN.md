# Diretrizes de UI/UX: Cardápio Churrascaria

## Contexto
Sistema de cardápio digital para churrascaria. Os clientes acessam
principalmente pelo celular, na mesa do restaurante. O painel
administrativo é usado em desktop/tablet.

## Regras gerais
- Alterar SOMENTE a camada visual (JSX, CSS/Tailwind, componentes de UI).
- NÃO mexer em lógica de negócio, chamadas de API, contexts, rotas ou
  autenticação.
- Manter todos os nomes de props, estados e funções existentes.
- Mostrar um resumo das mudanças antes de aplicar em várias telas.

## Estilo
- Moderno, limpo e acolhedor, com identidade de churrascaria.
- Tema escuro com tons quentes (brasa, âmbar, vinho) ou claro com
  detalhes em vermelho/marrom. Escolher um e manter consistência.
- Cantos arredondados, sombras suaves, bom espaçamento.

## Cores
- Definir variáveis (CSS ou Tailwind config): primária, secundária,
  destaque, fundo, superfície, texto, sucesso, erro.
- Contraste mínimo de 4.5:1 para texto.
- Não usar cor como único indicador de estado.

## Tipografia
- Um par de fontes: uma para títulos, outra para corpo.
- Hierarquia clara (h1, h2, corpo, legenda).
- Corpo com no mínimo 16px no mobile.

## Layout e responsividade
- Mobile-first.
- Áreas de toque com no mínimo 44x44px.
- Cards de produto com imagem, nome, descrição curta e preço em destaque.
- Botões principais fixos ou bem visíveis (ex.: "Ver pedido").

## Estados e feedback
- Toda tela deve ter estado de loading, vazio e erro.
- Botões com estado de hover, foco visível, desabilitado e carregando.
- Mensagens de erro claras (ex.: no login, mostrar o que houve).

## Acessibilidade
- Foco visível em todos os elementos interativos.
- Labels em todos os inputs.
- Alt em imagens.
- Respeitar prefers-reduced-motion.

## Evitar
- Visual genérico de template.
- Animações exageradas.
- Texto pequeno ou de baixo contraste.