import { NextResponse } from 'next/server';
import client from '@/lib/shopify';

const SHOP_QUERY = `
  query {
    shop {
      name
      primaryDomain {
        url
      }
    }
  }
`;

export async function GET() {
  const { data, errors } = await client.request(SHOP_QUERY);

  if (errors) {
    return NextResponse.json({ errors }, { status: 500 });
  }

  return NextResponse.json(data);
}
