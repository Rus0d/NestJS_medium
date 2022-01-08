import {Repository} from "typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";

import {UserEntity} from "@app/user/user.entity";
import {ProfileType} from "@app/profile/types/profile.type";
import {ProfileResponseInterface} from "@app/profile/types/profileResponse.interface";
import { FollowEntity } from "@app/profile/follow.entity";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository: Repository<FollowEntity>
    ) {}

    async getProfile (currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.userRepository.findOne({username: profileUsername});

        if (!user) {
            throw new HttpException("Profile does not found", HttpStatus.NOT_FOUND);
        }
        const follow = await this.followRepository.findOne({
            followerId: currentUserId,
            followingId: user.id
        });
        return { ...user, following: Boolean(follow) };
    }

    async followProfile (currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.userRepository.findOne({username: profileUsername});

        if (!user) {
            throw new HttpException("Profile does not found", HttpStatus.NOT_FOUND);
        }
        if (currentUserId === user.id) {
            throw new HttpException("You can't follow yourself", HttpStatus.BAD_REQUEST);
        }
        const follow = await this.followRepository.findOne({
            followerId: currentUserId,
            followingId: user.id
        });

        if (!follow) {
            const followToCreate = new FollowEntity();
            followToCreate.followerId = currentUserId;
            followToCreate.followingId = user.id;
            await this.followRepository.save(followToCreate);
        }

        return { ...user, following: true };
    }

    async unfollowProfile (currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.userRepository.findOne({username: profileUsername});

        if (!user) {
            throw new HttpException("Profile does not found", HttpStatus.NOT_FOUND);
        }
        if (currentUserId === user.id) {
            throw new HttpException("You can't unfollow yourself", HttpStatus.BAD_REQUEST);
        }

        await this.followRepository.delete({
            followerId: currentUserId,
            followingId: user.id
        });

        return { ...user, following: false };
    }

    buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
        delete profile.email;
        return { profile };
    }
}