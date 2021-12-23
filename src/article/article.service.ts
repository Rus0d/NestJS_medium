import {Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";

import {ArticleEntity} from "@app/article/article.entity";
import {UserEntity} from "@app/user/user.entity";
import {CreateArticleDto} from "@app/article/dto/createArticle.dto";

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>
    ) {}

    async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = article.title;
        article.author = currentUser;
        return await this.articleRepository.save(article);
    }
}