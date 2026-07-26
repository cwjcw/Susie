import brand from '../product/config/brand.json'

export type ProductBrand = Readonly<typeof brand>

export const productBrand: ProductBrand = Object.freeze(brand)
