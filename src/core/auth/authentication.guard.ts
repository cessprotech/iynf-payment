import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from './decorators';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MSResponse } from '@core/common/interfaces';
import { APP_CONFIG } from '@app/app.constants';

interface CustomRequest extends Request {
  sessionAuth: { [unit: string]: any };
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private reflector: Reflector, @Inject(APP_CONFIG.USER_SERVICE) private readonly userClient: ClientProxy) { }
  async canActivate(
    context: ExecutionContext,
  ) {
    const is_public = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (is_public) {
      return is_public;
    }

    const request = context.switchToHttp().getRequest<Request>() as CustomRequest;

    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('You are not authorized! Please Sign in.');
    }

    const response: MSResponse = await firstValueFrom(
      this.userClient.send({ cmd: 'USER_AUTH' }, { token }),
    );

    if (!response.status) {
      throw new UnauthorizedException(response.error);
    }

    request['user'] = response.data!;
    return true;
  }
}
