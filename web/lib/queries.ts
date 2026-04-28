// ── Shared metafield fragment ─────────────────────────────────────────────────
//
// Actual Shopify structure (from Admin API):
//   custom.model_year          → number_integer (e.g. "2025")
//   shopify.transmission-type  → list.metaobject_reference (GIDs like "gid://shopify/Metaobject/...")
//   shopify.item-condition     → list.metaobject_reference
//   shopify.fuel-supply        → list.metaobject_reference
//   shopify.drive-type         → list.metaobject_reference
//   shopify.vehicle-features   → list.metaobject_reference (accessories/features)
//
// Metaobject reference values are JSON arrays of GIDs. The metaobject labels
// (e.g. "Automatic", "Used", "Diesel") are resolved via the Admin API.

const PRODUCT_METAFIELDS = `
  year: metafield(namespace: "custom", key: "model_year") { value type }
  transmission: metafield(namespace: "shopify", key: "transmission-type") { value type }
  condition: metafield(namespace: "shopify", key: "item-condition") { value type }
  fuelType: metafield(namespace: "shopify", key: "fuel-supply") { value type }
  driveType: metafield(namespace: "shopify", key: "drive-type") { value type }
`

const MENU_RESOURCE_FRAGMENT = `
  resource {
    __typename
    ... on Collection {
      handle
    }
    ... on Product {
      handle
    }
    ... on Page {
      handle
    }
    ... on Blog {
      handle
    }
  }
`

// ── Products ──────────────────────────────────────────────────────────────────

export const GET_ALL_PRODUCTS_FOR_INDEX = `
  query getAllProductsForIndex($first: Int!, $cursor: String) {
    products(first: $first, after: $cursor) {
      edges {
        cursor
        node {
          id
          handle
          title
          description
          vendor
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          collections(first: 20) {
            edges {
              node {
                handle
              }
            }
          }
          ${PRODUCT_METAFIELDS}
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const GET_ALL_PRODUCTS = `
  query getAllProducts {
    products(first: 50) {
      edges {
        cursor
        node {
          id
          title
          description
          handle
          vendor
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 3) {
            edges {
              cursor
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          ${PRODUCT_METAFIELDS}
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_HANDLE = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      createdAt
      vendor
      tags
      availableForSale
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          cursor
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            handle
            title
            image {
              url
              altText
            }
          }
        }
      }
      ${PRODUCT_METAFIELDS}
    }
  }
`

export const GET_SHOP_INFO = `
  query getShopInfo {
    shop {
      name
      primaryDomain {
        url
      }
    }
  }
`

export const GET_HEADER_MENU = `
  query getHeaderMenu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      items {
        id
        title
        url
        type
        ${MENU_RESOURCE_FRAGMENT}
        items {
          id
          title
          url
          type
          ${MENU_RESOURCE_FRAGMENT}
        }
      }
    }
  }
`

// ── Collections ───────────────────────────────────────────────────────────────

export const GET_COLLECTIONS = `
  query getCollections {
    collections(first: 10, sortKey: TITLE, query: "product_count:>0") {
      edges {
        cursor
        node {
          id
          handle
          title
          image {
            url
            altText
          }
          description
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_COLLECTIONS_FOR_HEADER = `
  query getCollectionsForHeader {
    collections(first: 10, sortKey: TITLE) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`

export const GET_PRODUCTS_IN_COLLECTION = `
  query getProductsInCollection($handle: String!, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean, $filter: [ProductFilter!], $first: Int = 50) {
    collection(handle: $handle) {
      id
      title
      description
      image {
        url
        altText
      }
      products(first: $first, sortKey: $sortKey, reverse: $reverse, filters: $filter) {
        edges {
          node {
            id
            title
            handle
            vendor
            description
            availableForSale
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            ${PRODUCT_METAFIELDS}
          }
        }
      }
    }
  }
`

export const GET_RELATED_PRODUCTS_IN_COLLECTION = `
  query getRelatedProductsInCollection($handle: String!, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean, $filter: [ProductFilter!], $first: Int = 4) {
    collection(handle: $handle) {
      id
      title
      products(first: $first, sortKey: $sortKey, reverse: $reverse, filters: $filter) {
        edges {
          node {
            id
            title
            handle
            vendor
            description
            availableForSale
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            ${PRODUCT_METAFIELDS}
          }
        }
      }
    }
  }
`

export const SEARCH_PRODUCTS = `
  query searchProducts($query: String!, $first: Int = 10) {
    search(query: $query, first: $first, types: PRODUCT) {
      nodes {
        ... on Product {
          id
          title
          handle
          vendor
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

// ── Cart ──────────────────────────────────────────────────────────────────────

export const GET_CART = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      createdAt
      updatedAt
      checkoutUrl
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                product {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
            attributes {
              key
              value
            }
          }
        }
      }
      attributes {
        key
        value
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
        totalDutyAmount {
          amount
          currencyCode
        }
      }
      buyerIdentity {
        email
        phone
        customer {
          id
        }
        countryCode
      }
    }
  }
`

export const CREATE_CART = `
  mutation createCart($cartInput: CartInput) {
    cartCreate(input: $cartInput) {
      cart {
        id
        createdAt
        updatedAt
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
        attributes {
          key
          value
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

export const UPDATE_CART_LINES = `
  mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

export const REMOVE_CART_LINES = `
  mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 10) {
          edges {
            node {
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const ADD_CART_LINES = `
  mutation addCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        createdAt
        updatedAt
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
              attributes {
                key
                value
              }
            }
          }
        }
        attributes {
          key
          value
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
        buyerIdentity {
          email
          phone
          customer {
            id
          }
          countryCode
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`
