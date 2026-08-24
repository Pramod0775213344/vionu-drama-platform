import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'kdrama-secret-jwt-key-2026-super-secure',
  });

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const decoded = this.jwtService.verify(token);
        request.user = decoded;
      } catch {
        request.user = null;
      }
    }
    return true;
  }
}
