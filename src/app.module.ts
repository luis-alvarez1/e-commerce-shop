import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'mariadb',
			host: process.env.DB_HOST,
			username: process.env.DB_USER,
			port: +process.env.DB_PORT,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			autoLoadEntities: true,
			synchronize: true,
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
