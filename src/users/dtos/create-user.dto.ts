import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 96)
  @Matches(/^(?=.*[A-Zz-z])(?=.*\d)(?=.[@$!%#?&])[A-Za-z\d@$!%#?&]{8,}$/, {
    message:
      'Password must be a minimum of eight characters, one letter, one number and one special character'
  })
  password: string;
}