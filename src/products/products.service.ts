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
	async findAll() {
		return await this.productRepository.find();
	}

	async findOne(id: string) {
		const product = await this.productRepository.findOneBy({
			id,
		});

		if (!product) {
			throw new NotFoundException(`Product with id: ${id} not found`);
		}
		return product;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update(id: number, updateProductDto: UpdateProductDto) {
		return `This action updates a #${id} product`;
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
