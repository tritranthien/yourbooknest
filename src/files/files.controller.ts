import { Controller, Post, Get, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { FilesService } from './files.service';

@Controller('file')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    async uploadFile(@Req() req: FastifyRequest) {
        if (!req.isMultipart()) {
            throw new HttpException('Multipart form expected', HttpStatus.BAD_REQUEST);
        }

        const data = await req.file();
        if (!data) {
            throw new HttpException('File not found', HttpStatus.BAD_REQUEST);
        }

        const buffer = await data.toBuffer();
        try {
            const result = await this.filesService.uploadFile(buffer);
            return result;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('posters')
    async getPosters(@Query('next_cursor') next_cursor?: string) {
        try {
            const result = await this.filesService.getPosters(next_cursor);
            return result;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
