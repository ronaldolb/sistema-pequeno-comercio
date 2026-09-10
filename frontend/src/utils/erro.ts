// Extrai uma mensagem de erro amigável de uma resposta de erro do axios/NestJS.
// O NestJS às vezes devolve `message` como string e às vezes como array (erros de validação
// do class-validator, um por campo) — aqui a gente trata os dois casos.
export function mensagemErro(err: any, fallback: string): string {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(' ');
  if (typeof msg === 'string' && msg.trim()) return msg;
  return fallback;
}
