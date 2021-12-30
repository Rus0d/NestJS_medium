import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class UpdateArticleDto {
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    readonly description: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    readonly body: string;
}