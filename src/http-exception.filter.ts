import {
  ExceptionFilter,
  Catch,
  HttpException
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const message = exception.message;
    const statusCode = exception.getStatus();
    return { exception: { message, statusCode } };
  }
}
