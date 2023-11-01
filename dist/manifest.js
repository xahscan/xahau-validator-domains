"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ripple_address_codec_1 = require("ripple-address-codec");
const ripple_binary_codec_1 = require("ripple-binary-codec");
const ripple_keypairs_1 = require("ripple-keypairs");
const normalizeManifest_1 = require("./normalizeManifest");
/**
 * Verify a parsed manifest signature.
 *
 * @param manifest - A manifest object.
 * @throws If no signature is provided.
 * @returns True if the manifest signature is valid.
 */
function verifyManifestSignature(manifest) {
    const normalized = (0, normalizeManifest_1.normalizeManifest)(manifest);
    const sig = normalized.master_signature || normalized.signature;
    const signature = sig && Buffer.from(sig, 'hex').toString('hex');
    if (signature === undefined) {
        throw new Error('No signature was provided');
    }
    const signed = {
        Domain: normalized.domain,
        PublicKey: normalized.master_key,
        SigningPubKey: normalized.signing_key,
        Sequence: normalized.seq,
    };
    if (signed.Domain) {
        signed.Domain = Buffer.from(signed.Domain).toString('hex');
    }
    if (signed.PublicKey) {
        signed.PublicKey = (0, ripple_address_codec_1.decodeNodePublic)(signed.PublicKey).toString('hex');
    }
    if (signed.SigningPubKey) {
        signed.SigningPubKey = (0, ripple_address_codec_1.decodeNodePublic)(signed.SigningPubKey).toString('hex');
    }
    const signed_bytes = (0, ripple_binary_codec_1.encode)(signed);
    const manifestPrefix = Buffer.from('MAN\0');
    const data = Buffer.concat([
        manifestPrefix,
        Buffer.from(signed_bytes, 'hex'),
    ]).toString('hex');
    const key = Buffer.from(signed.PublicKey, 'hex').toString('hex');
    try {
        return (0, ripple_keypairs_1.verify)(data, signature, key);
    }
    catch (_a) {
        return false;
    }
}
exports.default = verifyManifestSignature;
