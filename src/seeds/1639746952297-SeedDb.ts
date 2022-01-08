import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDb1639746952297 implements MigrationInterface {
    name = 'SeedDb1639746952297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`);
        // password is 123
        await queryRunner.query(`INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$6fZ1gmPTaT7N5Qwg2Oe.3OUabl25r.nXzNi.yjCfx0wRQvkJUrh5C')`);
        await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article description', 'first article description body', 'dragons, coffee', 1)`);
        await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'second article description', 'second article description body', 'dragons, coffee', 1)`);
    }

    public async down(): Promise<void> {}

}
