export class AppError extends Error {
  constructor(status, message, code = 'REQUEST_ERROR', fields = undefined) {
    super(message); this.status = status; this.code = code; this.fields = fields;
  }
}
export const notFound = () => new AppError(404, 'Registro n\u00e3o encontrado.', 'NOT_FOUND');
