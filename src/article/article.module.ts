import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ArticleController} from "@app/article/article.controller";
import {ArticleEntity} from "@app/article/article.entity";
import {ArticleService} from "@app/article/article.service";
import {AuthGuard} from "@app/user/guards/auth.guard";
import {UserEntity} from "@app/user/user.entity";
import {FollowEntity} from "@app/profile/follow.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowEntity])],
    controllers: [ArticleController],
    providers: [ArticleService, AuthGuard],
})
export class ArticleModule {}