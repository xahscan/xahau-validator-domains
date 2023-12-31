"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeManifest = void 0;
const ripple_address_codec_1 = require("ripple-address-codec");
const ripple_binary_codec_1 = require("ripple-binary-codec");
/**
 * Helper function for type guards.
 *
 * @param param - Checks if a param is a Record.
 * @returns Type guard for Record.
 */
function isObject(param) {
    return typeof param === 'object' && param !== null;
}
/**
 * Check that the parameter is a valid Manifest object.
 *
 * @param param - Checks if a parameter is a manifest.
 * @returns Type guard for Manifest.
 */
function isManifest(param) {
    if (!isObject(param)) {
        return false;
    }
    const expected_keys = [
        'seq',
        'master_key',
        'master_signature',
        'domain',
        'signing_key',
        'signature',
    ];
    const extra_keys = Object.keys(param).filter((key) => !expected_keys.includes(key));
    return (extra_keys.length === 0 &&
        typeof param.seq === 'number' &&
        typeof param.master_key === 'string' &&
        typeof param.master_signature === 'string' &&
        (param.domain === undefined || typeof param.domain === 'string') &&
        (param.signing_key === undefined ||
            typeof param.signing_key === 'string') &&
        (param.signature === undefined || typeof param.signature === 'string'));
}
/**
 * Check that the parameter is a valid ManifestParsed object.
 *
 * @param param - Checks if a parameter is a ManifestParsed.
 * @returns Type guard for ManifestParsed.
 */
function isManifestParsed(param) {
    if (!isObject(param)) {
        return false;
    }
    const expected_keys = [
        'Sequence',
        'PublicKey',
        'MasterSignature',
        'Domain',
        'SigningPubKey',
        'Signature',
    ];
    const extra_keys = Object.keys(param).filter((key) => !expected_keys.includes(key));
    return (extra_keys.length === 0 &&
        typeof param.Sequence === 'number' &&
        typeof param.PublicKey === 'string' &&
        typeof param.MasterSignature === 'string' &&
        (param.Domain === undefined || typeof param.Domain === 'string') &&
        (param.SigningPubKey === undefined ||
            typeof param.SigningPubKey === 'string') &&
        (param.Signature === undefined || typeof param.Signature === 'string'));
}
/**
 * Check that the parameter is a valid StreamManifest object.
 *
 * @param param - Checks if a parameter is a StreamManifest.
 * @returns Type guard for StreamManifest.
 */
function isStreamManifest(param) {
    if (!isObject(param)) {
        return false;
    }
    const expected_keys = [
        'manifest',
        'seq',
        'master_key',
        'master_signature',
        'domain',
        'signing_key',
        'signature',
        'type',
    ];
    const extra_keys = Object.keys(param).filter((key) => !expected_keys.includes(key));
    return (extra_keys.length === 0 &&
        typeof param.seq === 'number' &&
        typeof param.master_key === 'string' &&
        typeof param.master_signature === 'string' &&
        (param.domain === undefined || typeof param.domain === 'string') &&
        (param.signing_key === undefined ||
            typeof param.signing_key === 'string') &&
        (param.signature === undefined || typeof param.signature === 'string'));
}
/**
 * Parses a hex-string encoded manifest.
 *
 * @param manifest - A hex-string encoded manifest.
 * @throws When manifest cannot be decoded or is invalid.
 * @returns Manifest parsed representation of the manifest.
 */
function manifestFromHex(manifest) {
    let parsed;
    try {
        parsed = (0, ripple_binary_codec_1.decode)(manifest);
    }
    catch (_u) {
        throw new Error(`Error Decoding Manifest`);
    }
    if (!isManifestParsed(parsed)) {
        throw new Error('Unrecognized Manifest Format');
    }
    const result = {
        Sequence: parsed.Sequence,
        MasterSignature: parsed.MasterSignature,
        PublicKey: (0, ripple_address_codec_1.encodeNodePublic)(Buffer.from(parsed.PublicKey, 'hex')),
    };
    if (parsed.Signature) {
        result.Signature = parsed.Signature;
    }
    if (parsed.Domain) {
        result.Domain = Buffer.from(parsed.Domain, 'hex').toString();
    }
    if (parsed.SigningPubKey) {
        result.SigningPubKey = (0, ripple_address_codec_1.encodeNodePublic)(Buffer.from(parsed.SigningPubKey, 'hex'));
    }
    return result;
}
/**
 * Normalizes a ManifestParsed to a Manifest.
 *
 * @param parsed - Manifest in ManifestParsed format.
 * @returns Normalized Manifest representation.
 */
function normalizeManifestParsed(parsed) {
    const result = {
        seq: parsed.Sequence,
        signature: parsed.Signature,
        master_signature: parsed.MasterSignature,
        master_key: parsed.PublicKey,
    };
    if (parsed.Domain) {
        result.domain = parsed.Domain;
    }
    if (parsed.SigningPubKey) {
        result.signing_key = parsed.SigningPubKey;
    }
    return result;
}
/**
 * Normalizes a StreamManifest to a Manifest.
 *
 * @param rpc - Manifest in StreamManifest format.
 * @returns Normalized Manifest representation.
 */
function normalizeStreamManifest(rpc) {
    const { type, manifest } = rpc, remaining = __rest(rpc, ["type", "manifest"]);
    return remaining;
}
/**
 * Normalizes a manifest to a Manifest object.
 *
 * @param manifest - Hex-string, StreamManifest, or ManifestParsed representation of a manifest.
 * @throws When manifest format is unrecognized.
 * @returns A normalized Manifest object.
 */
function normalizeManifest(manifest) {
    if (isManifest(manifest)) {
        return manifest;
    }
    let parsed;
    if (typeof manifest === 'string') {
        try {
            parsed = manifestFromHex(manifest);
        }
        catch (_u) {
            throw new Error(`Error Decoding Manifest`);
        }
    }
    else {
        parsed = manifest;
    }
    if (isManifestParsed(parsed)) {
        return normalizeManifestParsed(parsed);
    }
    if (isStreamManifest(parsed)) {
        return normalizeStreamManifest(parsed);
    }
    throw new Error(`Unrecognized Manifest format ${JSON.stringify(manifest)}`);
}
exports.normalizeManifest = normalizeManifest;
