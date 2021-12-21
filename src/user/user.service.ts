import {Repository} from "typeorm";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {sign} from "jsonwebtoken";
import {compare} from "bcrypt";


import {JWT_SECRET} from "@app/config";
import {CreateUserDto} from "@app/user/dto/createUser.dto";
import {LoginUserDto} from "@app/user/dto/loginUser.dto";
import {UserEntity} from "@app/user/user.entity";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async createUser(crateUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            email: crateUserDto.email
        });
        const userByUsername = await this.userRepository.findOne({
            username: crateUserDto.username
        });
        if (userByEmail || userByUsername) {
            throw new HttpException("Email or user name are taken.", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const newUser = new UserEntity();
        Object.assign(newUser, crateUserDto);
        return await this.userRepository.save(newUser);
    }

    async login(getUserDto: LoginUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            email: getUserDto.email
        }, {select: ["id", "username", "email", "bio", "image", "password"]});
        let match = false;
        if (userByEmail) {
            match = await compare(getUserDto.password, userByEmail.password);
        }
        if (match) {
            delete userByEmail.password
            return userByEmail;
        }
        throw new HttpException("Wrong password or email", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    generateJwt(user: UserEntity): string {
        const {id, email, username} = user;
        return sign({id, username, email}, JWT_SECRET);
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user)
            }
        }
    }
}