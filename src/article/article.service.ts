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
        let favoriteIds: number[] = [];

        if (query.tag) {
            queryBuilder.andWhere("articles.tagList LIKE :tag", {tag: `%${query.tag}%`});
        }
        if (query.author) {
            const author = await this.userRepository.findOne({
                username: query.author
            })
            queryBuilder.andWhere("articles.authorId = :id", {id: author.id});
        }
        if (query.favorited) {
            const author = await this.userRepository.findOne(
                {
                    username: query.favorited
                },
                {
                    relations: ["favorites"]
                }
            );
            const ids = author.favorites.map((el) => el.id);
            if (ids.length) {
                queryBuilder.andWhere("articles.authorId IN (:... ids)", { ids });
            } else {
                queryBuilder.andWhere("1=0");
            }
        }
        if (query.limit) {
            queryBuilder.limit(query.limit);
        }
        if (query.offset) {
            queryBuilder.offset(query.limit);
        }
        if( currentUserId ) {
            const currentUser = await this.userRepository.findOne( currentUserId,
                {
                    relations: ["favorites"]
                }
            );

            favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
        }
        const articles = await queryBuilder.getMany();
        const articlesWithFavorites = articles.map(article => {
            const favorited = favoriteIds.includes(article.id);
            return { ...article, favorited };
        });

        return {articles: articlesWithFavorites, articlesCount};
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

    async deleteArticleFromFavorites(currentUserId: number, slug: string): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites']
        });
        const articleIndex = user.favorites.findIndex((articleInFavorites) => articleInFavorites.id === article.id);

        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favoritesCount--;
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