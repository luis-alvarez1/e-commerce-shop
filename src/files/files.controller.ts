import {
	BadRequestException,
	Controller,
	Get,
	Param,
	Post,
	Res,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, filename } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
	constructor(
		private readonly filesService: FilesService,
		private readonly configService: ConfigService,
	) {}

	@Get('product/:name')
	findOne(@Param('name') image: string, @Res() res: Response) {
		const path = this.filesService.getStaticProductImage(image);
		res.sendFile(path);
	}

	@Post('product')
	@UseInterceptors(
		FileInterceptor('file', {
			fileFilter,
			storage: diskStorage({
				destination: './static/products',
				filename,
			}),
		}),
	)
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('Make sure that file is an image');
		}

		const url = `${this.configService.get('HOST_API')}/files/products/${file.filename}`;

		return { url };
	}
}
