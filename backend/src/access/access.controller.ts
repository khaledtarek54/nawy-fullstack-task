import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AccessService } from './access.service';
import { VerifyAccessDto } from './dto/verify-access.dto';

@Controller('access')
export class AccessController {
  constructor(private readonly service: AccessService) {}

  @Post('verify')
  @HttpCode(200)
  verify(@Body() body: VerifyAccessDto): { granted: boolean } {
    return { granted: this.service.verify(body.passphrase) };
  }
}
