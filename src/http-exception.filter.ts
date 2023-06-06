import { ExceptionFilter, Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException): {
    exception: { message: string; statusCode: number };
  } {
    const message: string = exception.message;
    const statusCode: number = exception.getStatus();
    return { exception: { message, statusCode } };
  }
}
