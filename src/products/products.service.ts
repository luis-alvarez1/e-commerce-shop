import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
@Injectable()
export class ProductsService {
	private readonly logger = new Logger('ProductsService');
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		@InjectRepository(ProductImage)
		private readonly productImageRepository: Repository<ProductImage>,

		private readonly dataSource: DataSource,
	) {}

	async create(createProductDto: CreateProductDto) {
		try {
			const { images = [], ...productDetails } = createProductDto;
			const product = this.productRepository.create({
				...productDetails,

				images: images.map((image) =>
					this.productImageRepository.create({ url: image }),
				),
			});
			await this.productRepository.save(product);
			return { ...product, images };
		} catch (error) {
			this.handleDBExceptions(error);
		}
	}

	async findAll(paginationDto: PaginationDto) {
		const { limit = 10, offset = 0 } = paginationDto;
		const products = await this.productRepository.find({
			take: limit,
			skip: offset,
			relations: {
				images: true,
			},
		});

		return products;
	}

	async findOne(term: string) {
		let product: Product;

		if (isUUID(term)) {
			product = await this.productRepository.findOneBy({
				id: term,
			});
		} else {
			product = await this.productRepository.findOneBy({
				slug: term,
			});
		}

		if (!product) {
			throw new NotFoundException(`Product with term: ${term} not found`);
		}
		return product;
	}

	async update(id: string, updateProductDto: UpdateProductDto) {
		const { images, ...dataToUpdate } = updateProductDto;
		const product = await this.productRepository.preload({
			id,
			...dataToUpdate,
		});

		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		if (!product) {
			throw new NotFoundException(`Product with id: ${id} not found`);
		}

		try {
			if (images) {
				await queryRunner.manager.delete(ProductImage, {
					product: { id },
				});

				product.images = images.map((img) =>
					this.productImageRepository.create({ url: img }),
				);
			} else {
				product.images = await this.productImageRepository.findBy({
					product: { id },
				});
			}

			await queryRunner.manager.save(product);

			await queryRunner.commitTransaction();
			await queryRunner.release();

			return product;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();

			this.handleDBExceptions(error);
		}
	}

	async remove(id: string) {
		const product = await this.findOne(id);
		await this.productRepository.remove(product);

		return product;
	}

	private handleDBExceptions(error: any) {
		if (error.code === 'ER_DUP_ENTRY') {
			throw new BadRequestException(error.message);
		}

		this.logger.error(error);
		throw new InternalServerErrorException('Something went wrong');
	}

	deleteAllProducts = async () => {
		const qb = this.productRepository.createQueryBuilder('product');

		try {
			return await qb.delete().where({}).execute();
		} catch (error) {
			this.handleDBExceptions(error);
		}
	};
}
