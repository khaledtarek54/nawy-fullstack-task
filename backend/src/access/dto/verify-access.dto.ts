import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccessDto {
  @IsString()
  @IsNotEmpty()
  passphrase!: string;
}
