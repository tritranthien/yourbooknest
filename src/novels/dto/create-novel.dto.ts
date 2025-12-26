import { IsNotEmpty, IsOptional, IsString, IsArray, IsEnum } from 'class-validator';

export class CreateNovelDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(['continue', 'completed', 'drop'])
  status?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
