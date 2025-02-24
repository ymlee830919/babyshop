export enum FeatureStatus {
    Original, New, Updated, Deleted
}

export interface BasicFeature {
    title: string;
    content: string;
}

export interface Feature extends BasicFeature {
    featureId: number;
    productId: number;
}

export interface ProductCategory {
    category: string;
}

export interface BasicProductInfo {
    productId: number;
    category: string;
    name: string;
    price: number;
    basePrice: number;
    variants: number;
    remoteUrl: string;
    isBestSeller: boolean;
    isNew: boolean;
    visible: boolean;
}

export interface BasicProduct {
    productId: number;
    categoryId: number;
    name: string;
    url: string;
    price: number;
    basePrice: number;
    image: string;
    remoteUrl: string;
    expiry: number;
    description?: string;
    isBestSeller: boolean;
    isNew: boolean;
    visible: boolean;
}

export interface Product extends BasicProduct {
    Features: Array<Feature>;
    Category: ProductCategory;
}

export interface CreatedProduct extends BasicProduct {
    createdAt: Date;
}

export interface UpdatedProduct extends BasicProduct {
    updatedAt: Date;
}
