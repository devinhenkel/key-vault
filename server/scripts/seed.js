import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/utils/crypto.js';

const prisma = new PrismaClient();

const sampleKeys = [
  {
    platformName: 'OpenAI',
    description: 'LLM API for chat completions and embeddings',
    endpointUrl: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    keyLabel: 'Production Key',
    keyValue: 'sk-DUMMY-OPENAI-KEY-1234567890-abcdef',
    createdBy: 'devin',
    expirationDate: new Date('2027-01-01'),
    notes: 'Primary production key. Rotate annually.',
    isActive: true,
  },
  {
    platformName: 'Anthropic',
    description: 'Claude API for chat and text analysis',
    endpointUrl: 'https://api.anthropic.com/v1',
    docsUrl: 'https://docs.anthropic.com',
    keyLabel: 'Dev Key',
    keyValue: 'sk-ant-DUMMY-ANTHROPIC-KEY-0987654321-xyz',
    createdBy: 'devin',
    expirationDate: null,
    notes: 'Development environment only.',
    isActive: true,
  },
  {
    platformName: 'Stripe',
    description: 'Payment processing API',
    endpointUrl: 'https://api.stripe.com/v1',
    docsUrl: 'https://stripe.com/docs/api',
    keyLabel: 'Webhook Key',
    keyValue: 'sk_test_DUMMY-STRIPE-KEY-abcdef123456',
    createdBy: 'devin',
    expirationDate: new Date('2026-08-15'),
    notes: 'Test mode key for webhook testing.',
    isActive: false,
  },
  {
    platformName: 'Mapbox',
    description: 'Maps and geocoding API',
    endpointUrl: 'https://api.mapbox.com',
    docsUrl: 'https://docs.mapbox.com/api',
    keyLabel: 'Maps Token',
    keyValue: 'pk.DUMMY-MAPBOX-TOKEN-9876543210',
    createdBy: 'devin',
    expirationDate: new Date('2026-07-20'),
    notes: 'Expires soon — remember to rotate.',
    isActive: true,
  },
];

async function main() {
  console.log('Seeding database with sample API key records...');

  // Clear existing records
  await prisma.apiKey.deleteMany();

  for (const key of sampleKeys) {
    await prisma.apiKey.create({
      data: {
        ...key,
        keyValue: encrypt(key.keyValue),
      },
    });
    console.log(`  ✓ ${key.platformName} — ${key.keyLabel}`);
  }

  console.log(`\nSeeded ${sampleKeys.length} records. All keys are obviously dummy values.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });