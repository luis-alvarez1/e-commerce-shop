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
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
@Injectable()
export class ProductsService {
	private readonly logger = new Logger('ProductsService');
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
	) {}

	async create(createProductDto: CreateProductDto) {
		try {
			const product = this.productRepository.create(createProductDto);
			await this.productRepository.save(product);
			return product;
		} catch (error) {
			this.handleDBExceptions(error);
		}
	}
	// TODO: pagination
	async findAll(paginationDto: PaginationDto) {
		const { limit = 10, offset = 0 } = paginationDto;
		return await this.productRepository.find({
			take: limit,
			skip: offset,
		});
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
		try {
			const product = await this.productRepository.preload({
				id,
				...updateProductDto,
			});

			if (!product) {
				throw new NotFoundException(`Product with id: ${id} not found`);
			}

			await this.productRepository.save(product);

			return product;
		} catch (error) {
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
}
