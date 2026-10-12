/**
 * Field and column config for the editable admin collections (/api/admin/:collection).
 * Field `key` may be a dot path (e.g. makingCharge.value) for nested objects.
 * Types: text, textarea, number, bool, select, image, list (comma separated), lines (one per line).
 * `optionsFrom` loads select options from another collection (value = slug).
 */
export const RESOURCES = {
  products: {
    title: 'Products', singular: 'Product', orderable: true,
    columns: [
      { key: 'images.0', label: '', type: 'image' },
      { key: 'name', label: 'Name', sub: 'sku' },
      { key: 'category', label: 'Category' },
      { key: 'metal', label: 'Metal', sub: 'purity' },
      { key: 'pricingMode', label: 'Pricing', type: 'status' },
      { key: 'stockQty', label: 'Stock' },
      { key: 'featured', label: 'Featured', type: 'bool' },
      { key: 'active', label: 'Active', type: 'bool' },
    ],
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'sku', label: 'SKU', hint: 'Auto-generated if blank' },
        { key: 'slug', label: 'Slug', hint: 'Auto-generated from name if blank' },
        { key: 'category', label: 'Category', type: 'select', optionsFrom: 'categories', required: true },
        { key: 'collections', label: 'Collections', type: 'list', hint: 'Collection slugs, comma separated' },
        { key: 'description', label: 'Description', type: 'textarea', full: true },
      ] },
      { title: 'Metal and pricing', fields: [
        { key: 'metal', label: 'Metal', type: 'select', options: ['GOLD', 'DIAMOND', 'SILVER'] },
        { key: 'purity', label: 'Purity', type: 'select', options: ['24K', '22K', '18K', '14K', '999', '925'] },
        { key: 'pricingMode', label: 'Pricing mode', type: 'select', options: ['RATE_LINKED', 'FIXED', 'ON_CALL'] },
        { key: 'fixedPrice', label: 'Fixed price (₹)', type: 'number', hint: 'Only for FIXED pricing' },
        { key: 'mrp', label: 'MRP (₹)', type: 'number' },
        { key: 'discountPct', label: 'Discount %', type: 'number' },
        { key: 'grossWeight', label: 'Gross weight (gm)', type: 'number' },
        { key: 'netWeight', label: 'Net weight (gm)', type: 'number' },
        { key: 'stoneWeight', label: 'Stone weight (gm)', type: 'number' },
        { key: 'stoneCharge', label: 'Stone charge (₹)', type: 'number' },
        { key: 'diamondCarat', label: 'Diamond carat', type: 'number' },
        { key: 'makingCharge.type', label: 'Making charge type', type: 'select', options: ['PCT', 'PER_GRAM', 'FLAT'] },
        { key: 'makingCharge.value', label: 'Making charge value', type: 'number' },
      ] },
      { title: 'Details', fields: [
        { key: 'certification', label: 'Certification' },
        { key: 'sizes', label: 'Sizes', type: 'list', hint: 'Comma separated, e.g. 10, 12, 14' },
        { key: 'tags', label: 'Tags', type: 'list', hint: 'e.g. new, trending, bridal' },
        { key: 'highlights', label: 'Highlights', type: 'lines', hint: 'One per line' },
        { key: 'images', label: 'Image URLs', type: 'lines', hint: 'One URL per line, first is the cover', full: true, preview: true },
      ] },
      { title: 'Inventory and visibility', fields: [
        { key: 'stockQty', label: 'Stock qty', type: 'number' },
        { key: 'inStock', label: 'In stock', type: 'bool' },
        { key: 'featured', label: 'Featured', type: 'bool' },
        { key: 'whatsappEnquiry', label: 'WhatsApp enquiry', type: 'bool' },
        { key: 'active', label: 'Active', type: 'bool' },
      ] },
    ],
    defaults: { metal: 'GOLD', purity: '22K', pricingMode: 'RATE_LINKED', makingCharge: { type: 'PCT', value: 12 }, inStock: true, stockQty: 1, active: true, featured: false, whatsappEnquiry: true, images: [], tags: [], sizes: [], collections: [], highlights: [], stoneWeight: 0, stoneCharge: 0, diamondCarat: 0, discountPct: 0 },
  },
  categories: {
    title: 'Categories', singular: 'Category', orderable: true,
    columns: [{ key: 'imageUrl', label: '', type: 'image' }, { key: 'name', label: 'Name', sub: 'slug' }, { key: 'active', label: 'Active', type: 'bool' }],
    sections: [{ fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'slug', label: 'Slug', hint: 'Auto-generated from name if blank' },
      { key: 'imageUrl', label: 'Image URL', type: 'image', full: true },
      { key: 'active', label: 'Active', type: 'bool' },
    ] }],
    defaults: { active: true },
  },
  collections: {
    title: 'Collections', singular: 'Collection', orderable: true,
    columns: [{ key: 'imageUrl', label: '', type: 'image' }, { key: 'name', label: 'Name', sub: 'slug' }, { key: 'tagline', label: 'Tagline' }, { key: 'active', label: 'Active', type: 'bool' }],
    sections: [{ fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'slug', label: 'Slug', hint: 'Auto-generated from name if blank' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'description', label: 'Description', type: 'textarea', full: true },
      { key: 'imageUrl', label: 'Image URL', type: 'image', full: true },
      { key: 'active', label: 'Active', type: 'bool' },
    ] }],
    defaults: { active: true },
  },
  banners: {
    title: 'Banners', singular: 'Banner', orderable: true,
    columns: [{ key: 'imageUrl', label: '', type: 'image' }, { key: 'title', label: 'Title', sub: 'subtitle' }, { key: 'placement', label: 'Placement', type: 'status' }, { key: 'ctaLink', label: 'Link' }, { key: 'active', label: 'Active', type: 'bool' }],
    sections: [{ fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'placement', label: 'Placement', type: 'select', options: ['hero', 'strip'] },
      { key: 'ctaText', label: 'Button text' },
      { key: 'ctaLink', label: 'Button link', hint: 'e.g. /jewellery?collection=bridal-edit' },
      { key: 'imageUrl', label: 'Desktop image URL', type: 'image', full: true },
      { key: 'mobileImageUrl', label: 'Mobile image URL', type: 'image', full: true },
      { key: 'active', label: 'Active', type: 'bool' },
    ] }],
    defaults: { placement: 'hero', active: true },
  },
  faqs: {
    title: 'FAQs', singular: 'FAQ', orderable: true,
    columns: [{ key: 'question', label: 'Question' }, { key: 'section', label: 'Section', type: 'status' }, { key: 'active', label: 'Active', type: 'bool' }],
    sections: [{ fields: [
      { key: 'section', label: 'Section', type: 'select', options: ['general', 'digigold-buy', 'digigold-sell', 'digigold-lease', 'digigold-redeem', 'ema', 'book-gold', 'advance-gold'] },
      { key: 'active', label: 'Active', type: 'bool' },
      { key: 'question', label: 'Question (English)', required: true, full: true },
      { key: 'answer', label: 'Answer (English)', type: 'textarea', full: true },
      { key: 'questionHi', label: 'Question (Hindi)', full: true },
      { key: 'answerHi', label: 'Answer (Hindi)', type: 'textarea', full: true },
    ] }],
    defaults: { section: 'general', active: true },
  },
  branches: {
    title: 'Branches', singular: 'Branch', orderable: false,
    columns: [{ key: 'name', label: 'Name', sub: 'code' }, { key: 'city', label: 'City' }, { key: 'phone', label: 'Phone' }, { key: 'isFlagship', label: 'Flagship', type: 'bool' }, { key: 'active', label: 'Active', type: 'bool' }],
    sections: [{ fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'code', label: 'Code' },
      { key: 'address', label: 'Address', full: true },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'pincode', label: 'Pincode' },
      { key: 'phone', label: 'Phone' },
      { key: 'hours', label: 'Hours' },
      { key: 'mapUrl', label: 'Map URL' },
      { key: 'isFlagship', label: 'Flagship store', type: 'bool' },
      { key: 'active', label: 'Active', type: 'bool' },
    ] }],
    defaults: { active: true, isFlagship: false },
  },
};

export const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
export function setPath(obj, path, value) {
  const keys = path.split('.');
  const out = { ...obj };
  let cur = out;
  keys.slice(0, -1).forEach((k) => { cur[k] = { ...(cur[k] || {}) }; cur = cur[k]; });
  cur[keys.at(-1)] = value;
  return out;
}
