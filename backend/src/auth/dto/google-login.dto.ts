import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsOptional()
  credential?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;
}
