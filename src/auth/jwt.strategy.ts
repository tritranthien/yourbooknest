
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('TOKEN_SECRET') || 'fallbackSecret',
    });
  }

  async validate(payload: any) {
    // payload is the decoded JWT. matches what we signed in auth.service:
    // { username: user.username, sub: user._id, ...user }
    return { _id: payload.sub, username: payload.username, role: payload.role };
  }
}
