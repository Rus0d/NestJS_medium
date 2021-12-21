import {Body, Controller, Post, Get, UsePipes, ValidationPipe, UseGuards, Put} from "@nestjs/common";

import {UserService} from "@app/user/user.service";
import {CreateUserDto} from "@app/user/dto/createUser.dto";
import {LoginUserDto} from "@app/user/dto/loginUser.dto";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {User} from "@app/user/decorators/user.decorator";
import {UserEntity} from "@app/user/user.entity";
import {AuthGuard} from "@app/user/guards/auth.guard";

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

    @Get("user")
    @UseGuards(AuthGuard)
    async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
        return this.userService.buildUserResponse(user);
    }

    @Put("user")
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateUser(
        @User("id") id: number,
        @Body("user") updateUserDto: UpdateUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.updateUser(id, updateUserDto);
        return this.userService.buildUserResponse(user);
    }
}