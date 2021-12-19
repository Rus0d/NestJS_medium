import {Repository} from "typeorm";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {sign} from "jsonwebtoken";

import {JWT_SECRET} from "@app/config";
import {CreateUserDto} from "@app/user/dto/createUser.dto";
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