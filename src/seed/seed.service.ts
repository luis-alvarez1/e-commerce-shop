import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
	constructor(private readonly productsService: ProductsService) {}

	async executeSeed() {
		await this.inserNewProducts();
		return 'Seed executed';
	}

	private inserNewProducts = async () => {
		await this.productsService.deleteAllProducts();
		const products = initialData.products;

		const insterPromises = [];

		products.forEach((product) => {
			insterPromises.push(this.productsService.create(product));
		});

		await Promise.all(insterPromises);
	};
}
