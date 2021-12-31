import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    Delete,
    Put,
    UsePipes,
    ValidationPipe,
    Query
} from "@nestjs/common";

import {ArticleService} from "@app/article/article.service";
import {AuthGuard} from "@app/user/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";
import {UserEntity} from "@app/user/user.entity";
import {CreateArticleDto} from "@app/article/dto/createArticle.dto";
import {ArticleResponseInterface} from "@app/article/types/articleResponse.interface";
import {UpdateArticleDto} from "@app/article/dto/updateArticle.dto";
import {ArticlesResponseInterface} from "@app/article/types/articlesResponse.interface";

@Controller("articles")
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get()
    async findAll (
        @User("id") currentUserId: number,
        @Query() query: any
    ): Promise<ArticlesResponseInterface> {
        return await this.articleService.findAll(currentUserId, query);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async createArticle(
        @User() currentUser: UserEntity,
        @Body("article") createArticleDto: CreateArticleDto
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser, createArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

    @Get(":slug")
    async getSingleArticle(
        @Param("slug") slug: string
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.findBySlug(slug);
        return this.articleService.buildArticleResponse(article);
    }

    @Put(":slug")
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateArticle(
        @User("id") currentUserId: number,
        @Body("article") updateArticleDto: UpdateArticleDto,
        @Param("slug") slug: string
    ): Promise<ArticleResponseInterface> {
        const article =  await this.articleService.updateArticle(slug, currentUserId, updateArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(":slug")
    @UseGuards(AuthGuard)
    async deleteArticle(
        @User("id") currentUserId: number,
        @Param("slug") slug: string
    ) {
        return await this.articleService.deleteArticle(slug, currentUserId);
    }
}