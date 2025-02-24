import { Injectable, NotFoundException } from "@nestjs/common";
import { InvalidOperationError } from "src/api/common/errors/invalid.error";
import { DatabaseService } from "src/services/database/database.service";
import { FeatureDTO, ProductDTO } from "./products.dto";
import { ImageSrc } from "src/api/common/types/common.types";
import { Product, CreatedProduct, UpdatedProduct, BasicProduct, BasicProductInfo, BasicFeature, FeatureStatus } from "./products.types";
import { name2url } from "src/services/utils/string.utils";

/**
 * Class to manage the unique settings record of the business
 */
@Injectable()
export class ProductsService {
    /**
     * Constructor of the class
     * @param database Database provider service
     */
    constructor(private readonly database: DatabaseService) {}


    async getList(): Promise<BasicProductInfo[]> {
        const productsWithVariantsCount = await this.database.products.findMany({
            select: {
                productId: true,
                name: true,
                basePrice: true,
                price: true,
                remoteUrl: true,
                isBestSeller: true,
                isNew: true,
                visible: true,
                Category: {
                    select: {
                        category: true
                    }
                },
                _count: {
                    select: {
                        Variants: true
                    }
                }
            }
        });
        
        // Format the result to match the desired output
        const result = productsWithVariantsCount.map(product => ({
            productId: product.productId,
            name: product.name,
            category: product.Category.category,
            remoteUrl: product.remoteUrl,
            basePrice: product.basePrice,
            price: product.price,
            variants: product._count.Variants,
            isBestSeller: product.isBestSeller,
            isNew: product.isNew,
            visible: product.visible,
        }));

        return result;
    }

    async getFullList(): Promise<Product[]> {
        let products = await this.database.products.findMany({
            include : {
                Category: true,
                Features: true
            }/*,
            where: {
                Category: {
                    url : categoryUrl
                }
            }*/
        })
        return products;
    }

    async get(productId: number) : Promise<Product | null> {
        return await this.database.products.findFirst({
            where: {productId}, 
            include : {
                Category: true,
                Features: true
            }
        });
    }

    async createProduct(product: ProductDTO, image: ImageSrc) : Promise<CreatedProduct> {

        // Validate the category exists
        let category = await this.database.categories.findFirst({
            where: {
                categoryId: parseInt(product.categoryId.toString())
            }
        });

        if(!category)
            throw new InvalidOperationError('The selected category do not exists');

        // Extract features
        let features : BasicFeature[] = [];
        product.features.forEach((feature: FeatureDTO) => {
            if(feature.status != FeatureStatus.Deleted)
                features.push({ title: feature.title, content: feature.content })
        });

        let created = await this.database.products.create({
            data: {
                categoryId: product.categoryId,
                price: product.price,
                basePrice: product.basePrice,
                name: product.name,
                url: name2url(product.name),
                isBestSeller: product.isBestSeller,
                isNew: product.isNew,
                visible: product.visible,
                description: product.description,
                image: image.local,
                remoteUrl: image.remote,
                expiry: image.expiryRemote,
                createdAt: new Date(),
                Features: {
                    createMany:{
                        data: features
                    }
                }
            }
        });

        return created;
    }

    async updateProduct(productId: number, 
        newProduct: ProductDTO,
        image?: ImageSrc
    ) : Promise<UpdatedProduct> {

        // Validate the selected product already exists
        let oldProduct = await this.database.products.findFirst({
            where: { productId },
        });

        if(!oldProduct)
            throw new NotFoundException("The selected product do not exists");

        // Validate the new category exists
        let category = await this.database.categories.findFirst({
            where : {
                categoryId : newProduct.categoryId
            }
        })

        if(!category)
            throw new NotFoundException("Selected category do not exists");

        let updated = await this.database.$transaction(async (database) => {

            let data : Partial<UpdatedProduct> = {
                categoryId: newProduct.categoryId,
                price: newProduct.price,
                basePrice: newProduct.basePrice,
                name: newProduct.name,
                url: name2url(newProduct.name),
                isBestSeller: newProduct.isBestSeller,
                isNew: newProduct.isNew,
                visible: newProduct.visible,
                description: newProduct.description,
                updatedAt: new Date()
            };

            if(image) {
                data.image = image.local;
                data.remoteUrl = image.remote;
                data.expiry = image.expiryRemote;
            }

            let record = await database.products.update({
                where: { productId }, data
            });

            // Update each feature
            for( let feature of newProduct.features){

                switch(feature.status) {
                    case FeatureStatus.New:
                        await database.productFeatures.create({data : {
                            productId, title: feature.title, content: feature.content, createdAt: new Date()
                        }})
                        break;

                    case FeatureStatus.Updated:
                        await database.productFeatures.update({
                            where: {
                                featureId : feature.featureId, productId
                            },
                            data : {
                                title: feature.title, content: feature.content, updatedAt: new Date()
                            }
                        })
                        break;

                    case FeatureStatus.Deleted:
                        await database.productFeatures.delete({
                            where: {
                                featureId : feature.featureId, productId
                            }});
                        break;

                    default: break;
                }
            }

            return record;
        });

        return updated;
    }

    async deleteProduct(productId: number) : Promise<BasicProduct>{

        // Validate there are not features types inside it
        let count = await this.database.productVariants.count({
            where: {
                productId
            }
        });

        if(!!count)
            throw new InvalidOperationError('The product you want to delete have variants inside. Can not be deleted.')

        let deleted = await this.database.$transaction(async (database) => {
            await database.productFeatures.deleteMany({
                where: {
                    productId
                }
            });

            return await database.products.delete({
                where : {
                    productId
                }
            })
        });

        return deleted;
    }
}