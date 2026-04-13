// ── Shared metafield fragment ─────────────────────────────────────────────────

const PRODUCT_METAFIELDS = `
  make: metafield(namespace: "vehicle", key: "make") { value type }
  model: metafield(namespace: "vehicle", key: "model") { value type }
  year: metafield(namespace: "vehicle", key: "year") { value type }
  mileage: metafield(namespace: "vehicle", key: "mileage") { value type }
  colour: metafield(namespace: "vehicle", key: "colour") { value type }
  fuelType: metafield(namespace: "vehicle", key: "fuel_type") { value type }
  transmission: metafield(namespace: "vehicle", key: "transmission") { value type }
  originCountry: metafield(namespace: "vehicle", key: "origin_country") { value type }
  condition: metafield(namespace: "vehicle", key: "condition") { value type }
  engine: metafield(namespace: "vehicle", key: "engine") { value type }
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
    collections(first: 10) {
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
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_PRODUCTS_IN_COLLECTION = `
  query getProductsInCollection($handle: String!, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean, $filter: [ProductFilter!], $first: Int = 50) {
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
