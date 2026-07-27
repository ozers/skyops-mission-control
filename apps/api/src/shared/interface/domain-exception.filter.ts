import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from '@skyops/contracts';
import { DomainError, DomainErrorKind } from '../domain/domain-error';

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  validation: HttpStatus.BAD_REQUEST,
  conflict: HttpStatus.CONFLICT,
  'not-found': HttpStatus.NOT_FOUND,
};

/* Maps any DomainError to its HTTP status and the shared error envelope. */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponse>();
    const request = ctx.getRequest<{ url: string }>();
    const statusCode = STATUS_BY_KIND[error.kind];

    const body: ApiErrorResponse = {
      statusCode,
      error: error.name,
      message: error.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(statusCode).json(body);
  }
}
