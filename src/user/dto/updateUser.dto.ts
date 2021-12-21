import {IsEmail, IsOptional, IsString, IsUrl, IsNotEmpty} from "class-validator";

export class UpdateUserDto {
    @IsEmail()
    @IsNotEmpty()
    @IsOptional()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly username: string;

    @IsUrl()
    @IsOptional()
    readonly image: string;

    @IsString()
    @IsOptional()
    readonly bio: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly password: string;
}