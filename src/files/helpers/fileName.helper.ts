import { v4 as uuid } from 'uuid';
import { Request } from 'express';

export const filename = (
	req: Request,
	file: Express.Multer.File,
	callback: (error: Error, newName: string) => void,
) => {
	if (!file) {
		return callback(new Error('File is empty'), '');
	}
	const fileExtension = file.mimetype.split('/')[1];

	const fileName = `${uuid()}.${fileExtension}`;
	callback(null, fileName);
};
