import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric-transformer';

@Entity({ name: 'products' })
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('text', { unique: true })
	title: string;

	@Column('decimal', {
		precision: 7,
		scale: 2,
		transformer: new ColumnNumericTransformer(),
		default: 0,
	})
	price: number;

	@Column('text', {
		nullable: true,
	})
	description: string;

	@Column('text', {
		unique: true,
	})
	slug: string;

	@Column('int', {
		default: 0,
	})
	stock: number;

	@Column('simple-array')
	sizes: string[];

	@Column('text')
	gender: string;

	@Column('simple-array')
	tags: string[];

	@OneToMany(() => ProductImage, (pImage) => pImage.product, {
		cascade: true,
		eager: true,
	})
	images?: ProductImage[];

	@BeforeInsert()
	checkSlugInsert() {
		if (!this.slug) {
			this.slug = this.title
				.toLowerCase()
				.replaceAll(' ', '_')
				.replaceAll("'", '');
		}

		// slug exists but can be invalid
		this.slug = this.slug
			.toLowerCase()
			.replaceAll(' ', '_')
			.replaceAll("'", '');
	}
	@BeforeUpdate()
	checkSlugUpdate() {
		// slug exists but can be invalid
		this.slug = this.slug
			.toLowerCase()
			.replaceAll(' ', '_')
			.replaceAll("'", '');
	}
}
