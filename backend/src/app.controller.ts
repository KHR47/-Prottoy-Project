import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello() {
    return {
      status: 'online',
      service: 'Prottoy Civic Transparency & Public Grid API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('stats/public')
  getPublicStats() {
    return this.appService.getPublicStats();
  }
}

