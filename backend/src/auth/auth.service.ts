import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '../common/enums/role.enum';
import { SafeUser } from '../common/types/request-with-user.type';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || Role.CITIZEN,
      phone: registerDto.phone,
      district: registerDto.district,
    });

    return {
      message: 'User registered successfully',
      user: this.toSafeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't leak whether email exists or not
      return { message: 'If the email exists, a reset link has been sent.', mockToken: null };
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'reset-password' },
      { expiresIn: '15m' }
    );

    return {
      message: 'If the email exists, a reset link has been sent.',
      mockToken: token, // Sent back for MVP testing purposes
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.purpose !== 'reset-password') {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new BadRequestException('Invalid token');

      await this.usersService.update(user.id, { password: newPassword });

      return { message: 'Password reset successfully' };
    } catch (e) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async googleLogin(credential: string) {
    if (!credential) {
      throw new BadRequestException('Google credential token is required');
    }

    try {
      const { OAuth2Client } = await import('google-auth-library');
      const clientId = process.env.GOOGLE_CLIENT_ID || '824497726439-97jvs4d12t3mvt7ttbco5s23qhe0lihq.apps.googleusercontent.com';
      const client = new OAuth2Client(clientId);

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: [
          clientId,
          '824497726439-97jvs4d12t3mvt7ttbco5s23qhe0lihq.apps.googleusercontent.com',
        ].filter(Boolean),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const email = payload.email.toLowerCase().trim();
      const name = payload.name || payload.given_name || 'Google User';

      // Find user or create if new
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Create new citizen account
        const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10);
        user = await this.usersService.create({
          name,
          email,
          password: randomPassword,
          role: Role.CITIZEN,
          phone: null,
          district: null,
        });
      }

      if (user.isActive === false) {
        throw new UnauthorizedException('This account has been deactivated. Please contact support.');
      }

      const jwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return {
        message: 'Google login successful',
        accessToken,
        user: this.toSafeUser(user),
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Google authentication failed: ' + (error?.message || 'Invalid token'));
    }
  }

  private toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    void password;

    return safeUser;
  }
}
