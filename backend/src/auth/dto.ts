import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail() email!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() @MinLength(6) password?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
