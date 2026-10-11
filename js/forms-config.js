/**
 * Envio dos formulários da página /contato.
 *
 * O site é estático: as mensagens e os currículos são recebidos por um serviço de formulários
 * externo (ex.: Formspree, Getform, Basin…). Cole aqui o endereço (endpoint) gerado pelo serviço.
 * O envio é um POST multipart (FormData) com o cabeçalho Accept: application/json.
 * O campo anti-spam se chama `_gotcha` e o assunto do e-mail vai em `_subject`.
 *
 * ⚠ Enquanto o endpoint estiver vazio, NADA é enviado: o formulário valida os campos e mostra
 *   um aviso de que o envio ainda não está ativo (nunca uma falsa confirmação).
 * ⚠ O formulário de carreiras envia um arquivo PDF: o serviço/plano escolhido precisa aceitar upload.
 * ⚠ Antes de ativar, atualizar a Política de Privacidade (hoje ela diz que o site não tem formulários).
 */
export const FORMS = {
  contato:   { endpoint: '' },   // ex.: 'https://formspree.io/f/xxxxxxxx'
  carreiras: { endpoint: '' },   // precisa aceitar arquivos (currículo em PDF)
};

/** Tempo mínimo (ms) entre abrir o formulário e enviar — bloqueia robôs que enviam instantaneamente. */
export const MIN_FILL_MS = 2500;
