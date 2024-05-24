import { Request } from 'express';

export const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	callback: (error: Error, acceptedFile: boolean) => void,
) => {
	if (!file) {
		return callback(new Error('File is empty'), false);
	}

	const fileExtension = file.mimetype.split('/')[1];
	const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

	if (validExtensions.includes(fileExtension)) {
		return callback(null, true);
	} else {
		return callback(
			new Error(`File extension: ${fileExtension} is not supported`),
			false,
		);
	}
};
