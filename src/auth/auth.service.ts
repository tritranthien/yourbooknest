import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id, ...user };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(createUserDto: any) {
    // Check if user exists
    const existingUser = await this.usersService.findOne(
      createUserDto.username,
    );
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }
    const existingEmail = await this.usersService.findOneByEmail(
        createUserDto.email,
      );
    if (existingEmail) {
        throw new UnauthorizedException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser.toObject();
    return this.login(result); // Auto login after register
  }
}
