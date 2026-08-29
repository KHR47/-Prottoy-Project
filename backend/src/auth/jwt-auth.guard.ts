import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import { isObservable, lastValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      try {
        const result = super.canActivate(context);
        if (isObservable(result)) {
          await lastValueFrom(result);
        } else if (result instanceof Promise) {
          await result;
        }
      } catch {
        // Public route ignores auth error
      }
      return true;
    }

    const result = super.canActivate(context);
    if (isObservable(result)) {
      return lastValueFrom(result);
    }
    return result as Promise<boolean> | boolean;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user || null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
