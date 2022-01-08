import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {UserEntity} from "@app/user/user.entity";
import {AuthGuard} from "@app/user/guards/auth.guard";
import {ProfileController} from "@app/profile/profile.controller";
import {ProfileService} from "@app/profile/profile.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [ProfileController],
    providers: [ProfileService, AuthGuard],
})
export class ProfileModule {}