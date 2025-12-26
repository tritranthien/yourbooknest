import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @MaxLength(255)
  description?: string;
}
