import {DeleteResult, getRepository, Repository} from "typeorm";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import slugify from "slugify";

import {ArticleEntity} from "@app/article/article.entity";
import {UserEntity} from "@app/user/user.entity";
import {CreateArticleDto} from "@app/article/dto/createArticle.dto";
import {ArticleResponseInterface} from "@app/article/types/articleResponse.interface";
import {UpdateArticleDto} from "@app/article/dto/updateArticle.dto";
import {ArticlesResponseInterface} from "@app/article/types/articlesResponse.interface";

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder("articles")
            .leftJoinAndSelect("articles.author", "author");
        queryBuilder.orderBy("articles.createdAt", "DESC");
        const articlesCount = await queryBuilder.getCount();

        if (query.tag) {
            queryBuilder.andWhere("articles.tagList LIKE :tag", {tag: `%${query.tag}%`});
        }
        if (query.author) {
            const author = await this.userRepository.findOne({
                username: query.author
            })
            queryBuilder.andWhere("articles.authorId = :id", {id: author.id});
        }
        if (query.limit) {
            queryBuilder.limit(query.limit);
        }
        if (query.offset) {
            queryBuilder.offset(query.limit);
        }
        const articles = await queryBuilder.getMany();


        return {articles, articlesCount};
    }

    async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = ArticleService.getSlug(createArticleDto.title);
        article.author = currentUser;
        return await this.articleRepository.save(article);
    }

    async findBySlug(slug: string): Promise<ArticleEntity> {
        return this.articleRepository.findOne({slug});
    }

    async updateArticle(slug: string, currentUserId: number, updateArticleDto: UpdateArticleDto): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        if(!article) {
            throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND);
        }

        if(article.author.id !== currentUserId) {
            throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.save(Object.assign(article, updateArticleDto));
    }

    async addArticleToFavorites(currentUserId: number, slug: string): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites']
        });

        const isNotFavorited = user.favorites.findIndex((articleInFavorites) => articleInFavorites.id === article.id) === -1;
        if (isNotFavorited) {
            user.favorites.push(article);
            article.favoritesCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.findBySlug(slug);

        if(!article) {
            throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND);
        }

        if(article.author.id !== currentUserId) {
            throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.delete({ slug });
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }

    private static getSlug(title: string): string {
        return `${slugify(title, {lower: true})}-${(Math.random() * Math.pow(36, 6) | 0).toString(36)}`;
    }
}