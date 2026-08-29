import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CastVoteDto {
  @IsString()
  @IsNotEmpty()
  targetType: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  targetId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsIn([1, -1])
  value: number;
}
