import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string;
	@Column('text', { unique: true })
	title: string;

	@Column('decimal', {
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
}