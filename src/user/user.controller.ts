import {Body, Controller, Post, UsePipes, ValidationPipe} from "@nestjs/common";

import {UserService} from "@app/user/user.service";
import {CreateUserDto} from "@app/user/dto/createUser.dto";
import {LoginUserDto} from "@app/user/dto/loginUser.dto";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("users")
    @UsePipes(new ValidationPipe())
    async createUser(@Body("user") crateUserDto: CreateUserDto): Promise<UserResponseInterface> {
        const user = await this.userService.createUser(crateUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Post("/user/login")
    @UsePipes(new ValidationPipe())
    async login(@Body("user") loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
        const user = await this.userService.login(loginUserDto);
        return this.userService.buildUserResponse(user);
    }
}