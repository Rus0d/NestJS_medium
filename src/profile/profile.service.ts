import {Repository} from "typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";

import {UserEntity} from "@app/user/user.entity";
import {ProfileType} from "@app/profile/types/profile.type";
import {ProfileResponseInterface} from "@app/profile/types/profileResponse.interface";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async getProfile (currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.userRepository.findOne({username: profileUsername});

        if (!user) {
            throw new HttpException("Profile does not found", HttpStatus.NOT_FOUND);
        }
        return { ...user, following: false };
    }

    buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
        delete profile.email;
        return { profile };
    }
}