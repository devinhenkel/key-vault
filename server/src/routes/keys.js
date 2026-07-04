import express from 'express';
import prisma from '../utils/prisma.js';
import { encrypt, decrypt, maskKey } from '../utils/crypto.js';
import { validateBody, validateApiKey } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/keys
 * List all keys. Key values are masked. Supports ?search= and ?active= query params.
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, active } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { platformName: { contains: search, mode: 'insensitive' } },
        { keyLabel: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { createdBy: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;

    const keys = await prisma.apiKey.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    // Never expose plaintext keys in list view
    const masked = keys.map((k) => ({
      ...k,
      keyValue: maskKey(decrypt(k.keyValue)),
    }));

    res.json(masked);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/keys/:id
 * Get a single key record (masked).
 */
router.get('/:id', async (req, res, next) => {
  try {
    const key = await prisma.apiKey.findUnique({
      where: { id: req.params.id },
    });
    if (!key) return res.status(404).json({ error: 'API key record not found' });

    res.json({
      ...key,
      keyValue: maskKey(decrypt(key.keyValue)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/keys
 * Create a new API key record.
 */
router.post('/', validateBody(validateApiKey), async (req, res, next) => {
  try {
    const { platformName, description, endpointUrl, docsUrl, keyLabel, keyValue, createdBy, expirationDate, notes, isActive } = req.body;

    const record = await prisma.apiKey.create({
      data: {
        platformName: platformName.trim(),
        description: description?.trim() || null,
        endpointUrl: endpointUrl?.trim() || null,
        docsUrl: docsUrl?.trim() || null,
        keyLabel: keyLabel.trim(),
        keyValue: encrypt(keyValue),
        createdBy: createdBy.trim(),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        notes: notes?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    // Return masked key
    res.status(201).json({
      ...record,
      keyValue: maskKey(decrypt(record.keyValue)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/keys/:id
 * Update an existing API key record.
 */
router.put('/:id', validateBody(validateApiKey), async (req, res, next) => {
  try {
    const { platformName, description, endpointUrl, docsUrl, keyLabel, keyValue, createdBy, expirationDate, notes, isActive } = req.body;

    const existing = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'API key record not found' });

    // Only re-encrypt if keyValue looks like a plaintext value (not a mask)
    const newKeyValue = (keyValue && !keyValue.includes('••••'))
      ? encrypt(keyValue)
      : existing.keyValue;

    const updated = await prisma.apiKey.update({
      where: { id: req.params.id },
      data: {
        platformName: platformName.trim(),
        description: description?.trim() || null,
        endpointUrl: endpointUrl?.trim() || null,
        docsUrl: docsUrl?.trim() || null,
        keyLabel: keyLabel.trim(),
        keyValue: newKeyValue,
        createdBy: createdBy.trim(),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        notes: notes?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.json({
      ...updated,
      keyValue: maskKey(decrypt(updated.keyValue)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/keys/:id
 * Delete an API key record.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'API key record not found' });

    await prisma.apiKey.delete({ where: { id: req.params.id } });
    res.json({ message: 'API key record deleted' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/keys/:id/reveal
 * Reveal the plaintext API key value. Returns only the key value.
 */
router.post('/:id/reveal', async (req, res, next) => {
  try {
    const key = await prisma.apiKey.findUnique({
      where: { id: req.params.id },
    });
    if (!key) return res.status(404).json({ error: 'API key record not found' });

    // This is the only endpoint that returns the plaintext key
    res.json({ keyValue: decrypt(key.keyValue) });
  } catch (err) {
    next(err);
  }
});

export default router;