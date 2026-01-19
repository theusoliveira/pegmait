# PEGMA IT — Landing Page (versão modernizada)

## Como rodar localmente
1. Entre na pasta do projeto.
2. Suba um servidor local (ex.:)
   - Python: `python -m http.server 8000`
   - Node: `npx serve`
3. Acesse `http://localhost:8000`.

## Personalizações rápidas
### 1) E-mail de contato
- Arquivos: `index.html` e `ainfraspend/index.html`
- Procure por `contato@pegmait.com.br` e substitua pelo seu e-mail.

### 2) Formulários (endpoint)
Por padrão:
- **Landing principal** (`#contato`): se `data-endpoint` estiver vazio, o formulário abre um `mailto:` (sem backend).
- **AInfraspend**: exige endpoint (dados sensíveis). Se `data-endpoint` estiver vazio, mostra um aviso.

Para configurar, defina um endpoint no atributo `data-endpoint` do `<form>`:
- `index.html` → `<form id="contactForm" data-endpoint="...">`
- `ainfraspend/index.html` → `<form id="ainfraspendForm" data-endpoint="...">`

O JavaScript envia um POST JSON com os campos do formulário.

## Estrutura
- `index.html` — Landing principal
- `ainfraspend/index.html` — Página do AInfraspend
- `css/style.css` — Estilos
- `js/main.js` — Interações (menu, scroll, validação e envio dos formulários)

