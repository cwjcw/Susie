import brand from '../product/config/brand.json'
import features from '../product/config/features.json'

export type ProductBrand = Readonly<typeof brand>
export type ProductFeatures = Readonly<typeof features>

export const productBrand: ProductBrand = Object.freeze(brand)
export const productFeatures: ProductFeatures = Object.freeze(features)
