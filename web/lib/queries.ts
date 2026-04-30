// ── Shared metafield fragment ─────────────────────────────────────────────────
//
// NOTE: Metafields are NOT fetched via the Storefront API fragment below.
// `resolveVehicleMetafields()` in shopify.ts fetches ALL product metafields
// dynamically via the Admin API (fetchProductMetafieldsAdmin), so the fragment
// here was redundant and has been removed to avoid hardcoded namespace/key
// coupling.
//
// Admin API metafield structure:
//   custom.model_year          → number_integer
//   shopify.transmission-type  → list.metaobject_reference (GIDs → labels resolved)
//   shopify.item-condition     → list.metaobject_reference
//   shopify.fuel-supply        → list.metaobject_reference
//   shopify.drive-type         → list.metaobject_reference
//   shopify.vehicle-features   → list.metaobject_reference

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
    collections(first: 10, sortKey: TITLE) {
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
  query getProductsInCollection($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filter: [ProductFilter!], $first: Int = 50) {
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

// ── Blog ─────────────────────────────────────────────────────────────────────────────

export const GET_BLOG_BY_HANDLE = `
  query getBlogByHandle($handle: String!) {
    blog(handle: $handle) {
      id
      handle
      title
      articles(first: 20) {
        edges {
          node {
            id
            handle
            title
            excerpt
            publishedAt
            image {
              url
              altText
            }
            author {
              name
            }
            tags
          }
        }
      }
    }
  }
`

export const GET_ARTICLE_BY_HANDLE = `
  query getArticleByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        handle
        title
        excerpt
        contentHtml
        publishedAt
        image {
          url
          altText
        }
        author {
          name
          bio
          email
        }
        tags
        seo {
          title
          description
        }
      }
    }
  }
`

// ── Admin API: Collection by handle ─────────────────────────────────────────────

export const GET_COLLECTION_BY_HANDLE_ADMIN = `
  query getCollectionByHandleAdmin($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      description
      image {
        url
        altText
      }
    }
  }
`

// ── Admin API: Products in collection with all metafields ──────────────────────

export const GET_PRODUCTS_ADMIN = `
  query getProductsAdmin($collectionId: ID!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(id: $collectionId) {
      id
      title
      description
      image {
        url
        altText
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            vendor
            description
            createdAt
            tags
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
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            vehicle_make: metafield(namespace: "vehicle", key: "make") { value }
            vehicle_model: metafield(namespace: "vehicle", key: "model") { value }
            vehicle_year: metafield(namespace: "vehicle", key: "year") { value }
            vehicle_mileage: metafield(namespace: "vehicle", key: "mileage") { value }
            vehicle_colour: metafield(namespace: "vehicle", key: "colour") { value }
            vehicle_fuel_type: metafield(namespace: "vehicle", key: "fuel_type") { value }
            vehicle_transmission: metafield(namespace: "vehicle", key: "transmission") { value }
            vehicle_origin_country: metafield(namespace: "vehicle", key: "origin_country") { value }
            vehicle_condition: metafield(namespace: "vehicle", key: "condition") { value }
            vehicle_engine: metafield(namespace: "vehicle", key: "engine") { value }
            shopify_transmission_type: metafield(namespace: "shopify", key: "transmission-type") { value type }
            shopify_item_condition: metafield(namespace: "shopify", key: "item-condition") { value type }
            shopify_fuel_supply: metafield(namespace: "shopify", key: "fuel-supply") { value type }
            shopify_drive_type: metafield(namespace: "shopify", key: "drive-type") { value type }
            shopify_vehicle_features: metafield(namespace: "shopify", key: "vehicle-features") { value type }
          }
        }
      }
    }
  }
`

// ── Admin API: Batch metaobject resolution ─────────────────────────────────────

export const RESOLVE_METAOBJECTS_BATCH = `
  query resolveMetaobjectsBatch($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        type
        handle
        fields {
          key
          value
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
