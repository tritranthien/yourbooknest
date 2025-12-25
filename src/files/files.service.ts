import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class FilesService {
    async uploadFile(file: Buffer, resourceType: 'image' | 'raw' | 'auto' = 'auto', folder: string = 'bookposter'): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: resourceType,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed: no result'));
                    resolve(result);
                },
            );

            streamifier.createReadStream(file).pipe(uploadStream);
        });
    }

    async getPosters(next_cursor?: string) {
        const options: any = {
            resource_type: 'image',
            folder: 'bookposter/',
            max_results: 10,
        };
        if (next_cursor) {
            options.next_cursor = next_cursor;
        }

        const result = await cloudinary.api.resources(options);
        const urls = result.resources.map((resource: any) => resource.secure_url);

        return {
            ...result,
            resources: urls,
        };
    }
}
