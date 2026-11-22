import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('AuthService - Telegram InitData Validation', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

  beforeEach(async () => {
    usersService = {
      upsertTelegramUser: jest.fn().mockResolvedValue({
        id: 'user-uuid-123',
        telegramId: '987654321',
        firstName: 'TestUser',
        isBlocked: false,
        balance: 50000,
      }),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'TELEGRAM_BOT_TOKEN') return botToken;
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const createValidInitData = (authDateSeconds: number, userObj = { id: 987654321, first_name: 'TestUser' }) => {
    const userStr = JSON.stringify(userObj);
    const query = new Map<string, string>();
    query.set('auth_date', authDateSeconds.toString());
    query.set('query_id', 'AAHdF6IQAAAAAN0XohDhrOrc');
    query.set('user', userStr);

    const sortedEntries = Array.from(query.entries()).sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = sortedEntries.map(([k, v]) => `${k}=${v}`).join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const params = new URLSearchParams();
    for (const [k, v] of query.entries()) {
      params.append(k, v);
    }
    params.append('hash', hash);

    return params.toString();
  };

  it('Haqiqiy toza initData to\'g\'ri tasdiqlanadi va JWT beriladi', async () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const validInitData = createValidInitData(currentTimestamp);

    const result = await service.validateTelegramData(validInitData);
    expect(result).toBeDefined();
    expect(result.access_token).toBe('mocked-jwt-token');
    expect(result.user.telegramId).toBe('987654321');
  });

  it('Soxta hash bilan kelgan initData qat\'iy rad etiladi', async () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const validInitData = createValidInitData(currentTimestamp);
    // Tamper with data or hash
    const fakeInitData = validInitData.replace(/hash=[a-f0-9]+/, 'hash=deadbeef00112233445566778899aabbccddeeff');

    await expect(service.validateTelegramData(fakeInitData)).rejects.toThrow(
      new UnauthorizedException('Invalid Telegram initData'),
    );
  });

  it('Eskirgan (24 soatdan oshgan) initData rad etiladi', async () => {
    const expiredTimestamp = Math.floor(Date.now() / 1000) - (86400 + 100); // 24 soat + 100 soniya oldin
    const expiredInitData = createValidInitData(expiredTimestamp);

    await expect(service.validateTelegramData(expiredInitData)).rejects.toThrow(
      new UnauthorizedException('Telegram auth_date is too old'),
    );
  });
});
